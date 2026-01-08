<?php

if ( ! defined('ABSPATH') ) {
    exit;
}

require_once SCGS_PATH . 'includes/database.php';

function scgs_calculate_subject_score( $student_id, $subject_id, $class_id, $term ) {

    $criteria = scgs_get_criteria_by_subject( $subject_id );
    $grades   = scgs_get_grades( $student_id, $subject_id, $class_id, $term );

    if ( empty($criteria) || empty($grades) ) {
        return null;
    }

    $total_score = 0;
    $total_weight = 0;

    foreach ( $criteria as $criterion ) {
        foreach ( $grades as $grade ) {

            if ( $grade->criteria_id == $criterion->id ) {

                $percentage = ($grade->score / $criterion->max_score) * 100;
                $weighted   = $percentage * ($criterion->weight / 100);

                $total_score  += $weighted;
                $total_weight += $criterion->weight;
            }
        }
    }

    if ( $total_weight == 0 ) {
        return null;
    }

    return round( $total_score, 2 );
}


function scgs_calculate_total_average( $student_id, $class_id, $term ) {

    $subjects = scgs_get_subjects_by_class( $class_id );

    $total_weighted_score = 0;
    $total_credits = 0;

    foreach ( $subjects as $subject ) {

        if ( ! $subject->count_in_total ) {
            continue;
        }

        $subject_score = scgs_calculate_subject_score(
            $student_id,
            $subject->id,
            $class_id,
            $term
        );

        if ( $subject_score === null ) {
            continue;
        }

        $total_weighted_score += $subject_score * $subject->credit_value;
        $total_credits        += $subject->credit_value;
    }

    if ( $total_credits == 0 ) {
        return null;
    }

    return round( $total_weighted_score / $total_credits, 2 );
}


function scgs_calculate_gpa( $student_id, $class_id, $term ) {

    $subjects = scgs_get_subjects_by_class( $class_id );

    $total_points = 0;
    $total_credits = 0;

    foreach ( $subjects as $subject ) {

        if ( ! $subject->count_in_total ) {
            continue;
        }

        $score = scgs_calculate_subject_score(
            $student_id,
            $subject->id,
            $class_id,
            $term
        );

        if ( $score === null ) {
            continue;
        }

        $total_points += $score * $subject->credit_value;
        $total_credits += $subject->credit_value;
    }

    if ( $total_credits == 0 ) {
        return null;
    }

    return round( $total_points / $total_credits, 2 );
}


function scgs_get_academic_standing( $total_average ) {
    global $wpdb;

    $row = $wpdb->get_row(
        "SELECT setting_value
         FROM {$wpdb->prefix}scgs_settings
         WHERE setting_key = 'academic_standing_ranges'"
    );

    if ( ! $row ) {
        return null;
    }

    $ranges = json_decode( $row->setting_value, true );

    foreach ( $ranges as $range ) {
        if ( $total_average >= $range['min'] && $total_average <= $range['max'] ) {
            return $range['label'];
        }
    }

    return null;
}

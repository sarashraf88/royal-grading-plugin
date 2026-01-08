<?php

if ( ! defined('ABSPATH') ) {
    exit;
}

function scgs_get_student( $student_id ) {
    global $wpdb;
    return $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}scgs_students WHERE id = %d",
            $student_id
        )
    );
}

function scgs_get_subjects_by_class( $class_id ) {
    global $wpdb;
    return $wpdb->get_results(
        $wpdb->prepare(
            "SELECT s.*
             FROM {$wpdb->prefix}scgs_subjects s
             JOIN {$wpdb->prefix}scgs_class_subjects cs
               ON s.id = cs.subject_id
             WHERE cs.class_id = %d",
            $class_id
        )
    );
}

function scgs_get_criteria_by_subject( $subject_id ) {
    global $wpdb;
    return $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}scgs_criteria
             WHERE subject_id = %d",
            $subject_id
        )
    );
}

function scgs_get_grades( $student_id, $subject_id, $class_id, $term ) {
    global $wpdb;
    return $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}scgs_grades
             WHERE student_id = %d
               AND subject_id = %d
               AND class_id = %d
               AND term = %s",
            $student_id, $subject_id, $class_id, $term
        )
    );
}

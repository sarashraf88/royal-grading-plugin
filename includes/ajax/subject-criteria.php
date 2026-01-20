<?php
if ( ! defined('ABSPATH') ) exit;

add_action('wp_ajax_scgs_get_subject_criteria', 'scgs_get_subject_criteria');
function scgs_get_subject_criteria() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();

    if ( empty($_POST['grade_level']) || empty($_POST['academic_year_id']) ) {
        wp_send_json_error(['message' => 'Missing parameters']);
    }

    global $wpdb;

    $subjects = $wpdb->prefix . 'scgs_subjects';
    $criteria = $wpdb->prefix . 'scgs_subject_criteria';

    $grade = sanitize_text_field($_POST['grade_level']);
    $year  = intval($_POST['academic_year_id']);

    $rows = $wpdb->get_results(
        $wpdb->prepare("
            SELECT
                s.id AS subject_id,
                s.name AS subject_name,
                IFNULL(c.weekly_weight, 0) AS weekly_weight,
                IFNULL(c.assessment_weight, 0) AS assessment_weight,
                IFNULL(c.final_weight, 0) AS final_weight,
                IFNULL(c.has_assessment, 1) AS has_assessment,
                IFNULL(c.credit_type, 'credit') AS credit_type
            FROM $subjects s
            LEFT JOIN $criteria c
                ON c.subject_id = s.id
                AND c.grade_level = %s
                AND c.academic_year_id = %d
            ORDER BY s.name ASC
        ", $grade, $year),
        ARRAY_A
    );

    wp_send_json_success($rows);
}

/**
 * SAVE
 */

add_action('wp_ajax_scgs_save_subject_criteria', 'scgs_save_subject_criteria');
function scgs_save_subject_criteria() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();

    if (
        empty($_POST['academic_year_id']) ||
        empty($_POST['grade_level']) ||
        empty($_POST['criteria'])
    ) {
        wp_send_json_error(['message' => 'Missing data']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_criteria';

    $year  = intval($_POST['academic_year_id']);
    $grade = sanitize_text_field($_POST['grade_level']);
    $rows  = json_decode(stripslashes($_POST['criteria']), true);

    foreach ($rows as $row) {

        $total =
            floatval($row['weekly_weight']) +
            floatval($row['assessment_weight']) +
            floatval($row['final_weight']);

        if ( round($total, 2) !== 100.00 ) {
            wp_send_json_error([
                'message' => 'Weights must equal 100%'
            ]);
        }

        $wpdb->replace(
            $table,
            [
                'subject_id'        => intval($row['subject_id']),
                'grade_level'       => $grade,
                'academic_year_id'  => $year,
                'weekly_weight'     => floatval($row['weekly_weight']),
                'assessment_weight' => floatval($row['assessment_weight']),
                'final_weight'      => floatval($row['final_weight']),
                'has_assessment'    => intval($row['has_assessment']),
                'credit_type'       => sanitize_text_field($row['credit_type']),
            ],
            [
                '%d','%s','%d','%f','%f','%f','%d','%s'
            ]
        );
    }

    wp_send_json_success(['message' => 'Criteria saved']);
}

/**
 * 
 */



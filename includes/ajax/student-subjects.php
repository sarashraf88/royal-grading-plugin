<?php
if ( ! defined('ABSPATH') ) exit;

/**
 * ==================================================
 * STUDENT SUBJECT GROUPS — AJAX HANDLERS
 * ==================================================
 */

/**
 * Get student subjects (by academic year)
 */
add_action('wp_ajax_scgs_get_student_subjects', 'scgs_get_student_subjects');
function scgs_get_student_subjects() {

    scgs_check_permissions();
    global $wpdb;

    if (
        empty($_POST['student_id']) ||
        empty($_POST['academic_year_id'])
    ) {
        wp_send_json_error();
    }

    $student_id = intval($_POST['student_id']);
    $year_id    = intval($_POST['academic_year_id']);

    $map      = $wpdb->prefix . 'scgs_student_subject_groups';
    $subjects = $wpdb->prefix . 'scgs_subjects';

    $rows = $wpdb->get_col(
        $wpdb->prepare("
            SELECT DISTINCT s.id
            FROM $subjects s
            INNER JOIN $map m
                ON m.subject_group_id = s.subject_group_id
            WHERE m.student_id = %d
              AND m.academic_year_id = %d
        ", $student_id, $year_id)
    );

    wp_send_json_success($rows);
}

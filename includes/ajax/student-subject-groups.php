<?php
if ( ! defined('ABSPATH') ) exit;

/**
 * ==================================================
 * STUDENT SUBJECT GROUPS — AJAX HANDLERS
 * ==================================================
 */

/**
 * Get Subject Groups assigned to a Student (per Academic Year)
 */
add_action('wp_ajax_scgs_get_student_subject_groups', 'scgs_get_student_subject_groups');
function scgs_get_student_subject_groups() {

    scgs_check_permissions();
    global $wpdb;

    if (
        empty($_POST['student_id']) ||
        empty($_POST['academic_year_id'])
    ) {
        wp_send_json_error(['message' => 'Missing required parameters']);
    }

    $table = $wpdb->prefix . 'scgs_student_subject_groups';

    $groups = $wpdb->get_col(
        $wpdb->prepare(
            "SELECT subject_group_id
             FROM $table
             WHERE student_id = %d
               AND academic_year_id = %d",
            intval($_POST['student_id']),
            intval($_POST['academic_year_id'])
        )
    );

    wp_send_json_success($groups);
}

/**
 * Save / Update Student Subject Groups (per Academic Year)
 */
add_action('wp_ajax_scgs_save_student_subject_groups', 'scgs_save_student_subject_groups');
function scgs_save_student_subject_groups() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if (
        empty($_POST['student_id']) ||
        empty($_POST['academic_year_id']) ||
        ! isset($_POST['subject_group_ids'])
    ) {
        wp_send_json_error(['message' => 'Missing required parameters']);
    }

    $student_id       = intval($_POST['student_id']);
    $academic_year_id = intval($_POST['academic_year_id']);
    $group_ids        = array_map('intval', (array) $_POST['subject_group_ids']);

    $table = $wpdb->prefix . 'scgs_student_subject_groups';

    // 1️⃣ Remove existing mappings for this student & year
    $wpdb->delete(
        $table,
        [
            'student_id'       => $student_id,
            'academic_year_id' => $academic_year_id,
        ]
    );

    // 2️⃣ Insert selected subject groups
    foreach ($group_ids as $group_id) {

        if ($group_id <= 0) continue;

        $wpdb->insert(
            $table,
            [
                'student_id'       => $student_id,
                'subject_group_id' => $group_id,
                'academic_year_id' => $academic_year_id,
            ]
        );
    }

    wp_send_json_success(['message' => 'Student subject groups saved']);
}

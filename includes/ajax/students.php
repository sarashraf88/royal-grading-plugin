<?php
if ( ! defined('ABSPATH') ) exit;

/**
 * ==================================================
 * STUDENTS — AJAX HANDLERS
 * ==================================================
 */

/**
 * Get Students
 */
add_action('wp_ajax_scgs_get_students', 'scgs_get_students');
function scgs_get_students() {
    scgs_check_permissions();
    global $wpdb;

    $students = $wpdb->prefix . 'scgs_students';
    $classes  = $wpdb->prefix . 'scgs_classes';

    $data = $wpdb->get_results(
        "SELECT
            s.id,
            s.student_code,
            s.first_name,
            s.last_name,
            s.nationality,
            s.date_of_birth,
            s.student_email,
            s.class_id,
            c.name AS class_name
         FROM $students s
         LEFT JOIN $classes c ON s.class_id = c.id
         ORDER BY s.id DESC",
        ARRAY_A
    );

    wp_send_json_success($data);
}

/**
 * Add Student
 */
add_action('wp_ajax_scgs_add_student', 'scgs_add_student');
function scgs_add_student() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if (
        empty($_POST['student_code']) ||
        empty($_POST['first_name']) ||
        empty($_POST['last_name']) ||
        empty($_POST['class_id'])
    ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    $table = $wpdb->prefix . 'scgs_students';

    $data = [
        'student_code'  => sanitize_text_field($_POST['student_code']),
        'first_name'    => sanitize_text_field($_POST['first_name']),
        'last_name'     => sanitize_text_field($_POST['last_name']),
        'nationality'   => ! empty($_POST['nationality'])
            ? sanitize_text_field($_POST['nationality'])
            : null,
        'date_of_birth' => ! empty($_POST['date_of_birth'])
            ? sanitize_text_field($_POST['date_of_birth'])
            : null,
        'student_email' => ! empty($_POST['student_email'])
            ? sanitize_email($_POST['student_email'])
            : null,
        'class_id'      => intval($_POST['class_id']),
    ];

    $result = $wpdb->insert($table, $data);

    if ($result === false) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    }

    wp_send_json_success(['message' => 'Student added']);
}

/**
 * Update Student
 */
add_action('wp_ajax_scgs_update_student', 'scgs_update_student');
function scgs_update_student() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if (
        empty($_POST['id']) ||
        empty($_POST['student_code']) ||
        empty($_POST['first_name']) ||
        empty($_POST['last_name']) ||
        empty($_POST['class_id'])
    ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    $table = $wpdb->prefix . 'scgs_students';

    $data = [
        'student_code'  => sanitize_text_field($_POST['student_code']),
        'first_name'    => sanitize_text_field($_POST['first_name']),
        'last_name'     => sanitize_text_field($_POST['last_name']),
        'nationality'   => ! empty($_POST['nationality'])
            ? sanitize_text_field($_POST['nationality'])
            : null,
        'date_of_birth' => ! empty($_POST['date_of_birth'])
            ? sanitize_text_field($_POST['date_of_birth'])
            : null,
        'student_email' => ! empty($_POST['student_email'])
            ? sanitize_email($_POST['student_email'])
            : null,
        'class_id'      => intval($_POST['class_id']),
    ];

    $result = $wpdb->update(
        $table,
        $data,
        ['id' => intval($_POST['id'])]
    );

    if ($result === false) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    }

    wp_send_json_success(['message' => 'Student updated']);
}

/**
 * Delete Student
 */
add_action('wp_ajax_scgs_delete_student', 'scgs_delete_student');
function scgs_delete_student() {
    scgs_check_permissions();

    if ( empty($_POST['id']) ) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_students';

    $wpdb->delete($table, ['id' => intval($_POST['id'])]);

    wp_send_json_success(['message' => 'Student deleted']);
}

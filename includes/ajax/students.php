<?php
if ( ! defined('ABSPATH') ) {
    exit;
}

/**
 * ==================================================
 * STUDENTS — AJAX HANDLERS
 * ==================================================
 */

/**
 * --------------------------------------------------
 * GET STUDENTS (basic data – used for edit forms)
 * --------------------------------------------------
 */
add_action('wp_ajax_scgs_get_students', 'scgs_get_students');
function scgs_get_students() {

    scgs_check_permissions();
    global $wpdb;

    $students = $wpdb->prefix . 'scgs_students';
    $classes  = $wpdb->prefix . 'scgs_classes';

    $rows = $wpdb->get_results("
        SELECT
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
        LEFT JOIN $classes c ON c.id = s.class_id
        ORDER BY s.id DESC
    ", ARRAY_A);

    wp_send_json_success($rows);
}

/**
 * --------------------------------------------------
 * GET STUDENTS WITH SUBJECTS (LIST VIEW)
 * --------------------------------------------------
 */
add_action('wp_ajax_scgs_get_students_with_subjects', 'scgs_get_students_with_subjects');
function scgs_get_students_with_subjects() {

    scgs_check_permissions();
    global $wpdb;

    if ( empty($_POST['academic_year_id']) ) {
        wp_send_json_error(['message' => 'Academic year required']);
    }

    $year_id = intval($_POST['academic_year_id']);

    $students = $wpdb->prefix . 'scgs_students';
    $classes  = $wpdb->prefix . 'scgs_classes';
    $map      = $wpdb->prefix . 'scgs_student_subject_groups';
    $groups   = $wpdb->prefix . 'scgs_subject_groups';
    $subjects = $wpdb->prefix . 'scgs_subjects';

    $rows = $wpdb->get_results(
        $wpdb->prepare("
            SELECT
                s.id,
                s.student_code,
                s.first_name,
                s.last_name,
                c.name AS class_name,
                GROUP_CONCAT(DISTINCT sub.name ORDER BY sub.name SEPARATOR ', ') AS subjects
            FROM $students s
            LEFT JOIN $classes c
                ON c.id = s.class_id
            LEFT JOIN $map m
                ON m.student_id = s.id
               AND m.academic_year_id = %d
            INNER JOIN $groups g
                ON g.id = m.subject_group_id
            INNER JOIN $subjects sub
                ON sub.subject_group_id = g.id
            GROUP BY s.id
            ORDER BY s.id DESC
        ", $year_id),
        ARRAY_A
    );

    wp_send_json_success($rows);
}

/**
 * --------------------------------------------------
 * ADD STUDENT
 * --------------------------------------------------
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

    wp_send_json_success([
        'message'    => 'Student added',
        'student_id' => $wpdb->insert_id
    ]);
}

/**
 * --------------------------------------------------
 * UPDATE STUDENT
 * --------------------------------------------------
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
 * --------------------------------------------------
 * DELETE STUDENT
 * --------------------------------------------------
 */
add_action('wp_ajax_scgs_delete_student', 'scgs_delete_student');
function scgs_delete_student() {

    scgs_check_permissions();
    global $wpdb;

    if ( empty($_POST['id']) ) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    $table = $wpdb->prefix . 'scgs_students';

    $wpdb->delete($table, ['id' => intval($_POST['id'])]);

    wp_send_json_success(['message' => 'Student deleted']);
}

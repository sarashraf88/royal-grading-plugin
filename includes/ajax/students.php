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

    // --------------------------------------------------
    // Security
    // --------------------------------------------------
    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();

    global $wpdb;

    $students_table = $wpdb->prefix . 'scgs_students';

    // --------------------------------------------------
    // Validate required fields
    // --------------------------------------------------
    $student_code  = trim($_POST['student_code'] ?? '');
    $first_name    = trim($_POST['first_name'] ?? '');
    $last_name     = trim($_POST['last_name'] ?? '');
    $class_id      = intval($_POST['class_id'] ?? 0);

    if (!$student_code || !$first_name || !$last_name || !$class_id) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    // --------------------------------------------------
    // Optional fields
    // --------------------------------------------------
    $nationality   = trim($_POST['nationality'] ?? '');
    $student_email = trim($_POST['student_email'] ?? '');

    // --------------------------------------------------
    // Date of Birth (SAFE parsing)
    // --------------------------------------------------
    $dob = null;
    $raw_dob = trim($_POST['date_of_birth'] ?? '');

    if ($raw_dob !== '') {
        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y', 'Y/m/d'] as $fmt) {
            $dt = DateTime::createFromFormat($fmt, $raw_dob);
            if ($dt !== false) {
                $dob = $dt->format('Y-m-d');
                break;
            }
        }
    }

    // --------------------------------------------------
    // Insert student
    // --------------------------------------------------
    $inserted = $wpdb->insert(
        $students_table,
        [
            'student_code'   => $student_code,
            'first_name'     => $first_name,
            'last_name'      => $last_name,
            'nationality'    => $nationality ?: null,
            'date_of_birth'  => $dob,
            'student_email'  => $student_email ?: null,
            'class_id'       => $class_id,
        ],
        ['%s','%s','%s','%s','%s','%s','%d']
    );

    if ($inserted === false) {
        wp_send_json_error([
            'message' => 'Failed to add student. Code or email may already exist.'
        ]);
    }

    $student_id = $wpdb->insert_id;

    // --------------------------------------------------
    // Save subject group (if provided)
    // --------------------------------------------------
    if (!empty($_POST['subject_group_id'])) {
        scgs_save_student_subject_group(
            $student_id,
            intval($_POST['subject_group_id'])
        );
    }

    // --------------------------------------------------
    // Done
    // --------------------------------------------------
    wp_send_json_success([
        'message'    => 'Student added successfully',
        'student_id' => $student_id
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
/**
 * 
 * Delete bulk students
 */

add_action('wp_ajax_scgs_bulk_delete_students', function () {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_students';

    $ids = $_POST['ids'] ?? [];
    if (!is_array($ids) || empty($ids)) {
        wp_send_json_error(['message' => 'No students selected']);
    }

    $ids = array_map('intval', $ids);
    $placeholders = implode(',', array_fill(0, count($ids), '%d'));

    $wpdb->query(
        $wpdb->prepare("DELETE FROM $table WHERE id IN ($placeholders)", $ids)
    );

    wp_send_json_success();
});


/**
 * assign subject group
 */

add_action('wp_ajax_scgs_assign_students_group', function () {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_student_subject_groups';

    $ids = $_POST['ids'] ?? [];
    $group_id = intval($_POST['group_id'] ?? 0);

    if (!$group_id || !is_array($ids)) {
        wp_send_json_error(['message' => 'Invalid data']);
    }

    foreach ($ids as $student_id) {
        $wpdb->insert($table, [
            'student_id' => intval($student_id),
            'subject_group_id' => $group_id
        ]);
    }

    wp_send_json_success();
});
/**
 * Student subejct group selection
*/
add_action('wp_ajax_scgs_get_subject_groups_by_grade', function () {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();

    global $wpdb;
    $groups = $wpdb->prefix . 'scgs_subject_groups';

    $grade_id = intval($_POST['grade_id'] ?? 0);
    if (!$grade_id) {
        wp_send_json_error(['message' => 'Invalid grade']);
    }

    $rows = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT id, name FROM $groups WHERE grade_id = %d ORDER BY name",
            $grade_id
        ),
        ARRAY_A
    );

    wp_send_json_success($rows);
});
add_action('wp_ajax_scgs_assign_students_subject_group', function () {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();

    global $wpdb;

    $table = $wpdb->prefix . 'scgs_student_subject_groups';

    $student_ids = $_POST['student_ids'] ?? [];
    $group_id    = intval($_POST['group_id'] ?? 0);
    $year_id     = intval($_POST['academic_year_id'] ?? 0);

    if (!$group_id || !$year_id || !is_array($student_ids)) {
        wp_send_json_error(['message' => 'Invalid data']);
    }

    foreach ($student_ids as $student_id) {
        $student_id = intval($student_id);

        // Remove previous assignment for this year
        $wpdb->delete($table, [
            'student_id' => $student_id,
            'academic_year_id' => $year_id
        ]);

        // Insert new assignment
        $wpdb->insert($table, [
            'student_id' => $student_id,
            'subject_group_id' => $group_id,
            'academic_year_id' => $year_id
        ]);
    }

    wp_send_json_success();
});
function scgs_get_active_academic_year_id() {
    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';

    return $wpdb->get_var(
        "SELECT id FROM $table WHERE is_active = 1 LIMIT 1"
    );
}

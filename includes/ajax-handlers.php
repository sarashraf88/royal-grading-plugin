<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * ==================================================
 * GLOBAL SECURITY CHECK
 * ==================================================
 */
function scgs_check_permissions() {

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( [ 'message' => 'Insufficient permissions' ] );
    }

    if ( empty( $_POST['nonce'] ) ) {
        wp_send_json_error( [ 'message' => 'Nonce missing' ] );
    }

    if ( ! wp_verify_nonce( $_POST['nonce'], 'scgs_nonce' ) ) {
        wp_send_json_error( [ 'message' => 'Invalid nonce' ] );
    }
}

/**
 * ==================================================
 * SUBJECT GROUPS
 * ==================================================
 */
add_action( 'wp_ajax_scgs_get_subject_groups', 'scgs_get_subject_groups' );
function scgs_get_subject_groups() {
    scgs_check_permissions();

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_groups';

    $groups = $wpdb->get_results(
        "SELECT * FROM $table ORDER BY id DESC",
        ARRAY_A
    );

    wp_send_json_success( $groups );
}

add_action( 'wp_ajax_scgs_add_subject_group', 'scgs_add_subject_group' );
function scgs_add_subject_group() {
    scgs_check_permissions();

    if (
        empty( $_POST['name'] ) ||
        empty( $_POST['grade_level'] )
    ) {
        wp_send_json_error( [ 'message' => 'Missing required fields' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_groups';

    $wpdb->insert(
        $table,
        [
            'name'        => sanitize_text_field( $_POST['name'] ),
            'grade_level' => sanitize_text_field( $_POST['grade_level'] ),
            'is_required' => isset( $_POST['is_required'] ) ? 1 : 0,
        ]
    );

    wp_send_json_success( [ 'message' => 'Subject group added' ] );
}

add_action( 'wp_ajax_scgs_delete_subject_group', 'scgs_delete_subject_group' );
function scgs_delete_subject_group() {
    scgs_check_permissions();

    if ( empty( $_POST['id'] ) ) {
        wp_send_json_error( [ 'message' => 'Missing ID' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_groups';

    $wpdb->delete( $table, [ 'id' => intval( $_POST['id'] ) ] );

    wp_send_json_success( [ 'message' => 'Subject group deleted' ] );
}

/**
 * ==================================================
 * CLASSES
 * ==================================================
 */
add_action( 'wp_ajax_scgs_get_classes', 'scgs_get_classes' );
function scgs_get_classes() {
    scgs_check_permissions();

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_classes';

    $classes = $wpdb->get_results(
        "SELECT * FROM $table ORDER BY id DESC",
        ARRAY_A
    );

    wp_send_json_success( $classes );
}

add_action( 'wp_ajax_scgs_add_class', 'scgs_add_class' );
function scgs_add_class() {
    scgs_check_permissions();

    if (
        empty( $_POST['name'] ) ||
        empty( $_POST['grade_level'] ) ||
        empty( $_POST['academic_year'] )
    ) {
        wp_send_json_error( [ 'message' => 'Missing required fields' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_classes';

    $wpdb->insert(
        $table,
        [
            'name'          => sanitize_text_field( $_POST['name'] ),
            'grade_level'   => sanitize_text_field( $_POST['grade_level'] ),
            'academic_year' => sanitize_text_field( $_POST['academic_year'] ),
        ]
    );

    wp_send_json_success( [ 'message' => 'Class added' ] );
}

add_action( 'wp_ajax_scgs_delete_class', 'scgs_delete_class' );
function scgs_delete_class() {
    scgs_check_permissions();

    if ( empty( $_POST['id'] ) ) {
        wp_send_json_error( [ 'message' => 'Missing ID' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_classes';

    $wpdb->delete( $table, [ 'id' => intval( $_POST['id'] ) ] );

    wp_send_json_success( [ 'message' => 'Class deleted' ] );
}
/**
 * --------------------------------------------------
 * CLASSES — UPDATE
 * --------------------------------------------------
 */
add_action( 'wp_ajax_scgs_update_class', 'scgs_update_class' );
function scgs_update_class() {
    scgs_check_permissions();

    if (
        empty( $_POST['id'] ) ||
        empty( $_POST['name'] ) ||
        empty( $_POST['grade_level'] ) ||
        empty( $_POST['academic_year'] )
    ) {
        wp_send_json_error( [ 'message' => 'Missing required fields' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_classes';

    $wpdb->update(
        $table,
        [
            'name'          => sanitize_text_field( $_POST['name'] ),
            'grade_level'   => sanitize_text_field( $_POST['grade_level'] ),
            'academic_year' => sanitize_text_field( $_POST['academic_year'] ),
        ],
        [ 'id' => intval( $_POST['id'] ) ]
    );

    wp_send_json_success( [ 'message' => 'Class updated successfully' ] );
}

/**
 * ==================================================
 * STUDENTS
 * ==================================================
 */
add_action( 'wp_ajax_scgs_get_students', 'scgs_get_students' );
function scgs_get_students() {
    scgs_check_permissions();

    global $wpdb;
    $students = $wpdb->prefix . 'scgs_students';
    $classes  = $wpdb->prefix . 'scgs_classes';

    $data = $wpdb->get_results(
        "SELECT s.id, s.student_code, s.first_name, s.last_name, s.class_id,
                c.name AS class_name
         FROM $students s
         LEFT JOIN $classes c ON s.class_id = c.id
         ORDER BY s.id DESC",
        ARRAY_A
    );

    wp_send_json_success( $data );
}

add_action( 'wp_ajax_scgs_add_student', 'scgs_add_student' );
function scgs_add_student() {
    scgs_check_permissions();

    if (
        empty( $_POST['student_code'] ) ||
        empty( $_POST['first_name'] ) ||
        empty( $_POST['last_name'] ) ||
        empty( $_POST['class_id'] )
    ) {
        wp_send_json_error( [ 'message' => 'Missing required fields' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_students';

    $wpdb->insert(
        $table,
        [
            'student_code' => sanitize_text_field( $_POST['student_code'] ),
            'first_name'   => sanitize_text_field( $_POST['first_name'] ),
            'last_name'    => sanitize_text_field( $_POST['last_name'] ),
            'class_id'     => intval( $_POST['class_id'] ),
        ]
    );

    wp_send_json_success( [ 'message' => 'Student added' ] );
}

add_action( 'wp_ajax_scgs_update_student', 'scgs_update_student' );
function scgs_update_student() {
    scgs_check_permissions();

    if (
        empty( $_POST['id'] ) ||
        empty( $_POST['student_code'] ) ||
        empty( $_POST['first_name'] ) ||
        empty( $_POST['last_name'] ) ||
        empty( $_POST['class_id'] )
    ) {
        wp_send_json_error( [ 'message' => 'Missing required fields' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_students';

    $wpdb->update(
        $table,
        [
            'student_code' => sanitize_text_field( $_POST['student_code'] ),
            'first_name'   => sanitize_text_field( $_POST['first_name'] ),
            'last_name'    => sanitize_text_field( $_POST['last_name'] ),
            'class_id'     => intval( $_POST['class_id'] ),
        ],
        [ 'id' => intval( $_POST['id'] ) ]
    );

    wp_send_json_success( [ 'message' => 'Student updated' ] );
}

add_action( 'wp_ajax_scgs_delete_student', 'scgs_delete_student' );
function scgs_delete_student() {
    scgs_check_permissions();

    if ( empty( $_POST['id'] ) ) {
        wp_send_json_error( [ 'message' => 'Missing ID' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_students';

    $wpdb->delete( $table, [ 'id' => intval( $_POST['id'] ) ] );

    wp_send_json_success( [ 'message' => 'Student deleted' ] );
}
/**
 * --------------------------------------------------
 * SUBJECT GROUPS — UPDATE
 * --------------------------------------------------
 */
add_action( 'wp_ajax_scgs_update_subject_group', 'scgs_update_subject_group' );
function scgs_update_subject_group() {
    scgs_check_permissions();

    if (
        empty( $_POST['id'] ) ||
        empty( $_POST['name'] ) ||
        empty( $_POST['grade_level'] )
    ) {
        wp_send_json_error( [ 'message' => 'Missing required fields' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_groups';

    $wpdb->update(
        $table,
        [
            'name'        => sanitize_text_field( $_POST['name'] ),
            'grade_level' => sanitize_text_field( $_POST['grade_level'] ),
            'is_required' => isset( $_POST['is_required'] ) ? 1 : 0,
        ],
        [ 'id' => intval( $_POST['id'] ) ]
    );

    wp_send_json_success( [ 'message' => 'Subject group updated' ] );
}
/**
 * ==================================================
 * SUBJECTS — GET (with group name)
 * ==================================================
 */
add_action( 'wp_ajax_scgs_get_subjects', 'scgs_get_subjects' );
function scgs_get_subjects() {
    scgs_check_permissions();

    global $wpdb;
    $subjects = $wpdb->prefix . 'scgs_subjects';
    $groups   = $wpdb->prefix . 'scgs_subject_groups';

    $data = $wpdb->get_results(
        "SELECT s.id, s.name, s.max_score, s.subject_group_id,
                g.name AS group_name
         FROM $subjects s
         LEFT JOIN $groups g ON s.subject_group_id = g.id
         ORDER BY s.id DESC",
        ARRAY_A
    );

    wp_send_json_success( $data );
}

/**
 * --------------------------------------------------
 * SUBJECTS — ADD
 * --------------------------------------------------
 */
add_action( 'wp_ajax_scgs_add_subject', 'scgs_add_subject' );
function scgs_add_subject() {
    scgs_check_permissions();

    if (
        empty( $_POST['name'] ) ||
        empty( $_POST['max_score'] ) ||
        empty( $_POST['subject_group_id'] )
    ) {
        wp_send_json_error( [ 'message' => 'Missing required fields' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subjects';

    $wpdb->insert(
        $table,
        [
            'name'             => sanitize_text_field( $_POST['name'] ),
            'max_score'        => intval( $_POST['max_score'] ),
            'subject_group_id' => intval( $_POST['subject_group_id'] ),
        ]
    );

    wp_send_json_success();
}

/**
 * --------------------------------------------------
 * SUBJECTS — UPDATE
 * --------------------------------------------------
 */
add_action( 'wp_ajax_scgs_update_subject', 'scgs_update_subject' );
function scgs_update_subject() {
    scgs_check_permissions();

    if (
        empty( $_POST['id'] ) ||
        empty( $_POST['name'] ) ||
        empty( $_POST['max_score'] ) ||
        empty( $_POST['subject_group_id'] )
    ) {
        wp_send_json_error( [ 'message' => 'Missing required fields' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subjects';

    $wpdb->update(
        $table,
        [
            'name'             => sanitize_text_field( $_POST['name'] ),
            'max_score'        => intval( $_POST['max_score'] ),
            'subject_group_id' => intval( $_POST['subject_group_id'] ),
        ],
        [ 'id' => intval( $_POST['id'] ) ]
    );

    wp_send_json_success();
}

/**
 * --------------------------------------------------
 * SUBJECTS — DELETE
 * --------------------------------------------------
 */
add_action( 'wp_ajax_scgs_delete_subject', 'scgs_delete_subject' );
function scgs_delete_subject() {
    scgs_check_permissions();

    if ( empty( $_POST['id'] ) ) {
        wp_send_json_error( [ 'message' => 'Missing ID' ] );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subjects';

    $wpdb->delete(
        $table,
        [ 'id' => intval( $_POST['id'] ) ]
    );

    wp_send_json_success();
}
/**
 * --------------------------------------------------
 * Acadmic year
 * --------------------------------------------------
 */
function scgs_get_active_academic_year_id() {
    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';
    return (int) $wpdb->get_var("SELECT id FROM $table WHERE is_active = 1 LIMIT 1");
}
add_action('wp_ajax_scgs_get_subject_criteria', function () {
    scgs_check_permissions();

    global $wpdb;
    $year_id = scgs_get_active_academic_year_id();
    if (!$year_id) wp_send_json_error(['message' => 'No active academic year']);

    $criteria = $wpdb->prefix . 'scgs_subject_criteria';
    $subjects = $wpdb->prefix . 'scgs_subjects';

    $rows = $wpdb->get_results("
        SELECT c.*, s.name AS subject_name
        FROM $criteria c
        JOIN $subjects s ON s.id = c.subject_id
        WHERE c.academic_year_id = $year_id
        ORDER BY c.grade_level, s.name
    ", ARRAY_A);

    wp_send_json_success($rows);
});
add_action('wp_ajax_scgs_save_subject_criteria', function () {
    scgs_check_permissions();

    $required = ['subject_id','grade_level','weekly_weight','assessment_weight','final_weight','credit_type'];
    foreach ($required as $r) {
        if (!isset($_POST[$r])) {
            wp_send_json_error(['message' => 'Missing fields']);
        }
    }

    $total =
        floatval($_POST['weekly_weight']) +
        floatval($_POST['assessment_weight']) +
        floatval($_POST['final_weight']);

    if (abs($total - 100) > 0.01) {
        wp_send_json_error(['message' => 'Weights must total 100']);
    }

    global $wpdb;
    $year_id = scgs_get_active_academic_year_id();
    if (!$year_id) wp_send_json_error(['message' => 'No active academic year']);

    $table = $wpdb->prefix . 'scgs_subject_criteria';

    $data = [
        'subject_id'        => intval($_POST['subject_id']),
        'grade_level'       => sanitize_text_field($_POST['grade_level']),
        'academic_year_id'  => $year_id,
        'has_assessment'    => isset($_POST['has_assessment']) ? 1 : 0,
        'weekly_weight'     => floatval($_POST['weekly_weight']),
        'assessment_weight' => floatval($_POST['assessment_weight']),
        'final_weight'      => floatval($_POST['final_weight']),
        'credit_type'       => sanitize_text_field($_POST['credit_type']),
    ];

    if (!empty($_POST['id'])) {
        $wpdb->update($table, $data, ['id' => intval($_POST['id'])]);
    } else {
        $wpdb->insert($table, $data);
    }

    wp_send_json_success();
});
/**
 * ==================================================
 * ACADEMIC YEARS — CRUD
 * ==================================================
 */

/**
 * Get all academic years
 */
add_action('wp_ajax_scgs_get_academic_years', function () {
    scgs_check_permissions();

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';

    $years = $wpdb->get_results(
        "SELECT * FROM $table ORDER BY id DESC",
        ARRAY_A
    );

    wp_send_json_success($years);
});

/**
 * Add academic year
 */
add_action('wp_ajax_scgs_add_academic_year', function () {
    scgs_check_permissions();

    if (empty($_POST['name'])) {
        wp_send_json_error(['message' => 'Academic year name is required']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';

    $wpdb->insert($table, [
        'name' => sanitize_text_field($_POST['name']),
        'is_active' => 0
    ]);

    wp_send_json_success();
});

/**
 * Set active academic year (only one)
 */
add_action('wp_ajax_scgs_set_active_academic_year', function () {
    scgs_check_permissions();

    if (empty($_POST['id'])) {
        wp_send_json_error();
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';

    // deactivate all
    $wpdb->update($table, ['is_active' => 0], ['is_active' => 1]);

    // activate selected
    $wpdb->update(
        $table,
        ['is_active' => 1],
        ['id' => intval($_POST['id'])]
    );

    wp_send_json_success();
});

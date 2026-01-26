<?php
if ( ! defined('ABSPATH') ) {
    exit;
}

/**
 * ==================================================
 * SUBJECTS — AJAX HANDLERS
 * ==================================================
 */

/**
 * Get Subjects (with group name)
 */
add_action('wp_ajax_scgs_get_subjects', 'scgs_get_subjects');
function scgs_get_subjects() {
    scgs_check_permissions();
    global $wpdb;

    $subjects = $wpdb->prefix . 'scgs_subjects';
    $groups   = $wpdb->prefix . 'scgs_subject_groups';
    $grades   = $wpdb->prefix . 'scgs_grades';

    $data = $wpdb->get_results(
        "
        SELECT
            s.id,
            s.name,
            s.max_score,
            s.grade_id,
            g.name AS grade_name,
            s.subject_group_id,
            sg.name AS group_name
        FROM $subjects s
        LEFT JOIN $grades g
            ON s.grade_id = g.id
        LEFT JOIN $groups sg
            ON s.subject_group_id = sg.id
        ORDER BY s.id DESC
        ",
        ARRAY_A
    );

    wp_send_json_success($data);
}


/**
 * Add Subject
 */
add_action('wp_ajax_scgs_add_subject', 'scgs_add_subject');
function scgs_add_subject() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if ( ! isset($_POST['name'], $_POST['max_score'], $_POST['grade_id']) ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    $grade_id = intval($_POST['grade_id']);
    if ( ! $grade_id ) {
        wp_send_json_error(['message' => 'Grade is required']);
    }

    $table = $wpdb->prefix . 'scgs_subjects';

    $data = [
        'name'              => sanitize_text_field($_POST['name']),
        'max_score'         => intval($_POST['max_score']),
        'grade_id'          => $grade_id,
        'subject_group_id' =>
            ( isset($_POST['subject_group_id']) && $_POST['subject_group_id'] !== '' )
                 ? intval($_POST['subject_group_id'])
            : null

    ];

    $result = $wpdb->insert($table, $data);

    if ($result === false) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    }

    wp_send_json_success(['message' => 'Subject added']);
}


/**
 * Update Subject
 */
add_action('wp_ajax_scgs_update_subject', 'scgs_update_subject');
function scgs_update_subject() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if ( ! isset($_POST['id'], $_POST['name'], $_POST['max_score'], $_POST['grade_id']) ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    $grade_id = intval($_POST['grade_id']);
    if ( ! $grade_id ) {
        wp_send_json_error(['message' => 'Grade is required']);
    }

    $table = $wpdb->prefix . 'scgs_subjects';

    $data = [
        'name'              => sanitize_text_field($_POST['name']),
        'max_score'         => intval($_POST['max_score']),
        'grade_id'          => $grade_id,
        'subject_group_id'  =>
            ( isset($_POST['subject_group_id']) && $_POST['subject_group_id'] !== '' )
                ? intval($_POST['subject_group_id'])
                : null
    ];

    $result = $wpdb->update(
        $table,
        $data,
        ['id' => intval($_POST['id'])]
    );

    if ($result === false) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    }

    wp_send_json_success(['message' => 'Subject updated']);
}


/**
 * Delete Subject
 */
add_action('wp_ajax_scgs_delete_subject', 'scgs_delete_subject');
function scgs_delete_subject() {
    scgs_check_permissions();

    if ( empty($_POST['id']) ) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subjects';

    $wpdb->delete($table, ['id' => intval($_POST['id'])]);

    wp_send_json_success(['message' => 'Subject deleted']);
}
/**
 * Get Subjects by Grade Level (grouped by Subject Group)
 */
add_action('wp_ajax_scgs_get_subjects_by_grade', 'scgs_get_subjects_by_grade');
function scgs_get_subjects_by_grade() {

    scgs_check_permissions();
    global $wpdb;

    if ( empty($_POST['grade_level']) ) {
        wp_send_json_error(['message' => 'Grade level required']);
    }

    $grade = sanitize_text_field($_POST['grade_level']);

    $subjects = $wpdb->prefix . 'scgs_subjects';
    $groups   = $wpdb->prefix . 'scgs_subject_groups';

    $rows = $wpdb->get_results(
        $wpdb->prepare("
            SELECT
                s.id AS subject_id,
                s.name AS subject_name,
                g.id AS group_id,
                g.name AS group_name
            FROM $subjects s
            INNER JOIN $groups g ON g.id = s.subject_group_id
            WHERE g.grade_level = %s
            ORDER BY g.name, s.name
        ", $grade),
        ARRAY_A
    );

    wp_send_json_success($rows);
}

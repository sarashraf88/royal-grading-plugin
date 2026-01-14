<?php
if ( ! defined('ABSPATH') ) exit;

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



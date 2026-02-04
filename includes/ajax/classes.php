<?php
if ( ! defined('ABSPATH') ) exit;

/**
 * ==================================================
 * CLASSES — AJAX CRUD
 * ==================================================
 */

/**
 * Get Classes
 */
add_action('wp_ajax_scgs_get_classes', 'scgs_get_classes');
function scgs_get_classes() {

    scgs_check_permissions();
    global $wpdb;

    $classes = $wpdb->prefix . 'scgs_classes';
    $grades  = $wpdb->prefix . 'scgs_grades';
    $years   = $wpdb->prefix . 'scgs_academic_years';

    $data = $wpdb->get_results("
        SELECT 
            c.id,
            c.name,
            c.grade_id,
            c.academic_year_id,
            g.name AS grade_name,
            y.name AS year_name
        FROM $classes c
        LEFT JOIN $grades g ON g.id = c.grade_id
        LEFT JOIN $years y ON y.id = c.academic_year_id
        ORDER BY c.id DESC
    ", ARRAY_A);

    wp_send_json_success($data);
}

/**
 * Add Class
 */
add_action('wp_ajax_scgs_add_class', 'scgs_add_class');
function scgs_add_class() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    // 🔴 STRICT validation (this was your issue)
    if (
        empty($_POST['name']) ||
        empty($_POST['grade_id']) ||
        empty($_POST['academic_year_id'])
    ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    $table = $wpdb->prefix . 'scgs_classes';

    $result = $wpdb->insert($table, [
        'name'              => sanitize_text_field($_POST['name']),
        'grade_id'          => intval($_POST['grade_id']),
        'academic_year_id'  => intval($_POST['academic_year_id']),
    ]);

    if ($result === false) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    }

    wp_send_json_success(['message' => 'Class added']);
}

/**
 * Update Class
 */
add_action('wp_ajax_scgs_update_class', 'scgs_update_class');
function scgs_update_class() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if (
        empty($_POST['id']) ||
        empty($_POST['name']) ||
        empty($_POST['grade_id']) ||
        empty($_POST['academic_year_id'])
    ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    $table = $wpdb->prefix . 'scgs_classes';

    $result = $wpdb->update(
        $table,
        [
            'name'              => sanitize_text_field($_POST['name']),
            'grade_id'          => intval($_POST['grade_id']),
            'academic_year_id'  => intval($_POST['academic_year_id']),
        ],
        ['id' => intval($_POST['id'])]
    );

    if ($result === false) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    }

    wp_send_json_success(['message' => 'Class updated']);
}

/**
 * Delete Class
 */
add_action('wp_ajax_scgs_delete_class', 'scgs_delete_class');
function scgs_delete_class() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if (empty($_POST['id'])) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    $table = $wpdb->prefix . 'scgs_classes';

    $wpdb->delete($table, ['id' => intval($_POST['id'])]);

    wp_send_json_success(['message' => 'Class deleted']);
}
/**
 * defualt value for acadmic year
 */
add_action('wp_ajax_scgs_get_active_academic_year', function () {

    scgs_check_permissions();
    global $wpdb;

    $table = $wpdb->prefix . 'scgs_academic_years';

    $year = $wpdb->get_row(
        "SELECT id, name FROM $table WHERE is_active = 1 LIMIT 1",
        ARRAY_A
    );

    if (!$year) {
        wp_send_json_error(['message' => 'No active academic year']);
    }

    wp_send_json_success($year);
});

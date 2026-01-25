<?php
if ( ! defined('ABSPATH') ) exit;

/**
 * ==================================================
 * GRADES — AJAX CRUD
 * ==================================================
 */

/**
 * Get Grades
 */
add_action('wp_ajax_scgs_get_grades', 'scgs_get_grades');
function scgs_get_grades() {
    scgs_check_permissions();
    global $wpdb;

    $table = $wpdb->prefix . 'scgs_grades';

    $grades = $wpdb->get_results(
        "SELECT id, name FROM $table WHERE is_active = 1 ORDER BY sort_order ASC",
        ARRAY_A
    );

    wp_send_json_success($grades);
}


/**
 * Add Grade
 */
add_action('wp_ajax_scgs_add_grade', 'scgs_add_grade');
function scgs_add_grade() {
    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if ( empty($_POST['name']) ) {
        wp_send_json_error(['message' => 'Grade name is required']);
    }

    $table = $wpdb->prefix . 'scgs_grades';

    $result = $wpdb->insert($table, [
        'name' => sanitize_text_field($_POST['name'])
    ]);

    if ($result === false) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    }

    wp_send_json_success(['message' => 'Grade added']);
}

/**
 * Update Grade
 */
add_action('wp_ajax_scgs_update_grade', 'scgs_update_grade');
function scgs_update_grade() {
    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();
    global $wpdb;

    if ( empty($_POST['id']) || empty($_POST['name']) ) {
        wp_send_json_error(['message' => 'Missing fields']);
    }

    $table = $wpdb->prefix . 'scgs_grades';

    $result = $wpdb->update(
        $table,
        ['name' => sanitize_text_field($_POST['name'])],
        ['id' => intval($_POST['id'])]
    );

    if ($result === false) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    }

    wp_send_json_success(['message' => 'Grade updated']);
}

/**
 * Delete Grade
 */
add_action('wp_ajax_scgs_delete_grade', 'scgs_delete_grade');
function scgs_delete_grade() {
    scgs_check_permissions();
    global $wpdb;

    if ( empty($_POST['id']) ) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    $table = $wpdb->prefix . 'scgs_grades';

    $wpdb->delete($table, [
        'id' => intval($_POST['id'])
    ]);

    wp_send_json_success(['message' => 'Grade deleted']);
}

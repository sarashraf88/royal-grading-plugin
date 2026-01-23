<?php
if ( ! defined('ABSPATH') ) exit;

/**
 * Get Grades
 */
add_action('wp_ajax_scgs_get_grades', 'scgs_get_grades');
function scgs_get_grades() {

    check_ajax_referer('scgs_nonce', 'nonce');
    scgs_check_permissions();

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_grades';

    $grades = $wpdb->get_results(
        "SELECT id, name
         FROM $table
         WHERE is_active = 1
         ORDER BY sort_order ASC",
        ARRAY_A
    );

    wp_send_json_success($grades);
}

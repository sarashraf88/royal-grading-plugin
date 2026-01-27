<?php
if ( ! defined('ABSPATH') ) exit;

/**
 * ==================================================
 * SUBJECT GROUPS — AJAX HANDLERS
 * ==================================================
 */


/**
 * Get Subject Groups
 */
add_action('wp_ajax_scgs_get_subject_groups', 'scgs_get_subject_groups');
function scgs_get_subject_groups() {
    scgs_check_permissions();
    global $wpdb;

    $groups = $wpdb->prefix . 'scgs_subject_groups';
    $grades = $wpdb->prefix . 'scgs_grades';

    $data = $wpdb->get_results("
       SELECT
    sg.id,
    sg.name,
    sg.grade_id,
    sg.is_required,
    g.name AS grade_name
    FROM {$wpdb->prefix}scgs_subject_groups sg
    LEFT JOIN {$wpdb->prefix}scgs_grades g
    ON sg.grade_id = g.id
    ORDER BY sg.id DESC

    ", ARRAY_A);

    wp_send_json_success($data);
}


/**
 * Add Subject Group
 */
add_action('wp_ajax_scgs_add_subject_group', 'scgs_add_subject_group');
function scgs_add_subject_group() {
    scgs_check_permissions();
    check_ajax_referer('scgs_nonce', 'nonce');

    if (empty($_POST['name']) || empty($_POST['grade_id'])) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_groups';

    $wpdb->insert($table, [
        'name'        => sanitize_text_field($_POST['name']),
        'grade_id'    => intval($_POST['grade_id']),
        'is_required' => intval($_POST['is_required'])
    ]);

    wp_send_json_success();
}


/**
 * Update Subject Group
 */
add_action('wp_ajax_scgs_update_subject_group', 'scgs_update_subject_group');
function scgs_update_subject_group() {
    scgs_check_permissions();
    check_ajax_referer('scgs_nonce', 'nonce');

    if (empty($_POST['id']) || empty($_POST['name']) || empty($_POST['grade_id'])) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_groups';

    $wpdb->update($table, [
        'name'        => sanitize_text_field($_POST['name']),
        'grade_id'    => intval($_POST['grade_id']),
        'is_required' => intval($_POST['is_required'])
    ], [
        'id' => intval($_POST['id'])
    ]);

    wp_send_json_success();
}


/**
 * Delete Subject Group (safe)
 */
add_action('wp_ajax_scgs_delete_subject_group', 'scgs_delete_subject_group');
function scgs_delete_subject_group() {
    scgs_check_permissions();

    if (empty($_POST['id'])) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    global $wpdb;
    $wpdb->delete(
        $wpdb->prefix . 'scgs_subject_groups',
        ['id' => intval($_POST['id'])]
    );

    wp_send_json_success();
}


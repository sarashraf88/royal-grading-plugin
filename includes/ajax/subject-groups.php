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

    $table = $wpdb->prefix . 'scgs_subject_groups';

    $groups = $wpdb->get_results(
        "SELECT id, name, grade_level, is_required FROM $table ORDER BY id DESC",
        ARRAY_A
    );

    wp_send_json_success($groups);
}

/**
 * Add Subject Group
 */
add_action('wp_ajax_scgs_add_subject_group', 'scgs_add_subject_group');
function scgs_add_subject_group() {
    scgs_check_permissions();

    if ( ! isset($_POST['name'], $_POST['grade_level']) ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_groups';

    $wpdb->insert($table, [
        'name'        => sanitize_text_field($_POST['name']),
        'grade_level' => sanitize_text_field($_POST['grade_level']),
        'is_required' => isset($_POST['is_required']) ? 1 : 0,
    ]);

    wp_send_json_success(['message' => 'Subject group added']);
}

/**
 * Update Subject Group
 */
add_action('wp_ajax_scgs_update_subject_group', 'scgs_update_subject_group');
function scgs_update_subject_group() {
    scgs_check_permissions();

    if ( ! isset($_POST['id'], $_POST['name'], $_POST['grade_level']) ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_groups';

    $wpdb->update(
        $table,
        [
            'name'        => sanitize_text_field($_POST['name']),
            'grade_level' => sanitize_text_field($_POST['grade_level']),
            'is_required' => isset($_POST['is_required']) ? 1 : 0,
        ],
        [
            'id' => intval($_POST['id']),
        ]
    );

    wp_send_json_success(['message' => 'Subject group updated']);
}

/**
 * Delete Subject Group (safe)
 */
add_action('wp_ajax_scgs_delete_subject_group', 'scgs_delete_subject_group');
function scgs_delete_subject_group() {
    scgs_check_permissions();

    if ( empty($_POST['id']) ) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    global $wpdb;
    $group_id = intval($_POST['id']);

    // Prevent deleting group that has subjects
    $subjects_table = $wpdb->prefix . 'scgs_subjects';
    $count = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(*) FROM $subjects_table WHERE subject_group_id = %d",
            $group_id
        )
    );

    if ( $count > 0 ) {
        wp_send_json_error([
            'message' => 'Cannot delete group that has subjects assigned'
        ]);
    }

    $groups_table = $wpdb->prefix . 'scgs_subject_groups';
    $wpdb->delete($groups_table, ['id' => $group_id]);

    wp_send_json_success(['message' => 'Subject group deleted']);
}

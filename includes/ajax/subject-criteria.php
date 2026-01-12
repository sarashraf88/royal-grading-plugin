<?php
if ( ! defined('ABSPATH') ) {
    exit;
}

/**
 * ======================================================
 * SUBJECT CRITERIA — AJAX HANDLERS
 * ======================================================
 */

/**
 * Get Subject Criteria
 */
add_action('wp_ajax_scgs_get_subject_criteria', 'scgs_get_subject_criteria');
function scgs_get_subject_criteria() {

    scgs_check_permissions();
    global $wpdb;

    $table = $wpdb->prefix . 'scgs_subject_criteria';

    $criteria = $wpdb->get_results("
        SELECT
            id,
            subject_id,
            criteria_name,
            max_score
        FROM $table
        ORDER BY id DESC
    ", ARRAY_A);

    wp_send_json_success($criteria);
}

/**
 * Add Subject Criterion
 */
add_action('wp_ajax_scgs_add_subject_criteria', 'scgs_add_subject_criteria');
function scgs_add_subject_criteria() {

    scgs_check_permissions();

    if (
        ! isset($_POST['subject_id'], $_POST['criteria_name'], $_POST['max_score'])
    ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_criteria';

    $wpdb->insert(
        $table,
        [
            'subject_id'    => intval($_POST['subject_id']),
            'criteria_name' => sanitize_text_field($_POST['criteria_name']),
            'max_score'     => floatval($_POST['max_score']),
        ]
    );

    wp_send_json_success(['message' => 'Criteria added successfully']);
}

/**
 * Update Subject Criterion
 */
add_action('wp_ajax_scgs_update_subject_criteria', 'scgs_update_subject_criteria');
function scgs_update_subject_criteria() {

    scgs_check_permissions();

    if (
        ! isset($_POST['id'], $_POST['subject_id'], $_POST['criteria_name'], $_POST['max_score'])
    ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_criteria';

    $wpdb->update(
        $table,
        [
            'subject_id'    => intval($_POST['subject_id']),
            'criteria_name' => sanitize_text_field($_POST['criteria_name']),
            'max_score'     => floatval($_POST['max_score']),
        ],
        [
            'id' => intval($_POST['id']),
        ]
    );

    wp_send_json_success(['message' => 'Criteria updated successfully']);
}

/**
 * Delete Subject Criterion
 */
add_action('wp_ajax_scgs_delete_subject_criteria', 'scgs_delete_subject_criteria');
function scgs_delete_subject_criteria() {

    scgs_check_permissions();

    if ( empty($_POST['id']) ) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_subject_criteria';

    $wpdb->delete(
        $table,
        [
            'id' => intval($_POST['id']),
        ]
    );

    wp_send_json_success(['message' => 'Criteria deleted successfully']);
}

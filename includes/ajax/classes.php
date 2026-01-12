<?php
if ( ! defined('ABSPATH') ) exit;


/**
 * ==================================================
 * CLASSES
 * ==================================================
 */

add_action('wp_ajax_scgs_get_academic_years', 'scgs_get_academic_years');
function scgs_get_academic_years() {

    check_ajax_referer('scgs_nonce', 'nonce');
    global $wpdb;

    $table = $wpdb->prefix . 'scgs_academic_years';

    $years = $wpdb->get_results("
        SELECT id, name, is_active
        FROM $table
        ORDER BY name DESC
    ");

    wp_send_json_success($years);
}

add_action('wp_ajax_scgs_get_classes', 'scgs_get_classes');
function scgs_get_classes() {
    scgs_check_permissions();
    global $wpdb;

    $table = $wpdb->prefix . 'scgs_classes';

    $classes = $wpdb->get_results("
        SELECT
            id,
            name,
            grade_level,
            academic_year
        FROM $table
        ORDER BY id DESC
    ", ARRAY_A);

    wp_send_json_success($classes);
}

/**
 * --------------------
 * Add class
 * ---------------------
 */

add_action('wp_ajax_scgs_add_class', 'scgs_add_class');
function scgs_add_class() {
    scgs_check_permissions();

    if (
        ! isset($_POST['name'], $_POST['grade_level'], $_POST['academic_year'])
    ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_classes';

    $wpdb->insert(
        $table,
        [
            'name'          => sanitize_text_field($_POST['name']),
            'grade_level'   => sanitize_text_field($_POST['grade_level']),
            'academic_year' => sanitize_text_field($_POST['academic_year']),
        ]
    );

    wp_send_json_success(['message' => 'Class added']);
}


/**
 * -------------------------------------------------------------
 * CLASSES-DELETE
 * -------------------------------------------------------------
 */

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
add_action('wp_ajax_scgs_update_class', 'scgs_update_class');
function scgs_update_class() {
    scgs_check_permissions();

    if (
        ! isset($_POST['id'], $_POST['name'], $_POST['grade_level'], $_POST['academic_year'])
    ) {
        wp_send_json_error(['message' => 'Missing required fields']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_classes';

    $wpdb->update(
        $table,
        [
            'name'          => sanitize_text_field($_POST['name']),
            'grade_level'   => sanitize_text_field($_POST['grade_level']),
            'academic_year' => sanitize_text_field($_POST['academic_year']),
        ],
        ['id' => intval($_POST['id'])]
    );

    wp_send_json_success(['message' => 'Class updated successfully']);
}

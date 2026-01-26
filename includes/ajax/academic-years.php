<?php
if (!defined('ABSPATH')) exit;

/* =====================================================
   GET ACADEMIC YEARS
===================================================== */
add_action('wp_ajax_scgs_get_academic_years', function () {
    scgs_check_permissions();
    check_ajax_referer('scgs_nonce', 'nonce');

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';

    $years = $wpdb->get_results(
        "SELECT * FROM $table ORDER BY start_date DESC",
        ARRAY_A
    );

    wp_send_json_success($years);
});

/* =====================================================
   ADD ACADEMIC YEAR (ALWAYS INACTIVE)
===================================================== */
add_action('wp_ajax_scgs_add_academic_year', function () {
    scgs_check_permissions();
    check_ajax_referer('scgs_nonce', 'nonce');

    if (
        empty($_POST['name']) ||
        empty($_POST['start_date']) ||
        empty($_POST['end_date'])
    ) {
        wp_send_json_error(['message' => 'All fields are required']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';

    $wpdb->insert($table, [
        'name'       => sanitize_text_field($_POST['name']),
        'start_date' => sanitize_text_field($_POST['start_date']),
        'end_date'   => sanitize_text_field($_POST['end_date']),
        'is_active'  => 0
    ]);

    wp_send_json_success();
});

/* =====================================================
   UPDATE ACADEMIC YEAR (NO is_active HERE)
===================================================== */
add_action('wp_ajax_scgs_update_academic_year', function () {
    scgs_check_permissions();
    check_ajax_referer('scgs_nonce', 'nonce');

    if (
        empty($_POST['id']) ||
        empty($_POST['name']) ||
        empty($_POST['start_date']) ||
        empty($_POST['end_date'])
    ) {
        wp_send_json_error(['message' => 'Missing data']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';

    $wpdb->update(
        $table,
        [
            'name'       => sanitize_text_field($_POST['name']),
            'start_date' => sanitize_text_field($_POST['start_date']),
            'end_date'   => sanitize_text_field($_POST['end_date'])
        ],
        ['id' => intval($_POST['id'])]
    );

    wp_send_json_success();
});

/* =====================================================
   SET ACTIVE YEAR (ONLY ONE)
===================================================== */
add_action('wp_ajax_scgs_set_active_academic_year', function () {
    scgs_check_permissions();
    check_ajax_referer('scgs_nonce', 'nonce');

    if (empty($_POST['id'])) {
        wp_send_json_error(['message' => 'Missing ID']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';
    $id = intval($_POST['id']);

    $wpdb->query('START TRANSACTION');

    $wpdb->query("UPDATE $table SET is_active = 0");
    $wpdb->update($table, ['is_active' => 1], ['id' => $id]);

    $wpdb->query('COMMIT');

    wp_send_json_success();
});

/* =====================================================
   DELETE ACADEMIC YEAR (BLOCK ACTIVE)
===================================================== */
add_action('wp_ajax_scgs_delete_academic_year', function () {
    scgs_check_permissions();
    check_ajax_referer('scgs_nonce', 'nonce');

    global $wpdb;
    $table = $wpdb->prefix . 'scgs_academic_years';
    $id = intval($_POST['id']);

    $is_active = $wpdb->get_var(
        $wpdb->prepare("SELECT is_active FROM $table WHERE id=%d", $id)
    );

    if ($is_active) {
        wp_send_json_error(['message' => 'Cannot delete active academic year']);
    }

    $wpdb->delete($table, ['id' => $id]);
    wp_send_json_success();
});

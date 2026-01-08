<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'rest_api_init', function () {

    register_rest_route( 'scgs/v1', '/classes', [
        'methods'  => WP_REST_Server::READABLE,
        'callback' => 'scgs_get_classes',
        'permission_callback' => 'scgs_can_view_classes',
    ] );

});

function scgs_can_view_classes() {
    return is_user_logged_in() && current_user_can( 'scgs_view_classes' );
}


function scgs_get_classes() {
    global $wpdb;

    $table = $wpdb->prefix . 'scgs_classes';

    return $wpdb->get_results(
        "SELECT * FROM {$table} ORDER BY grade_level, section",
        ARRAY_A
    );
}

<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue React app for admin
 */
add_action( 'admin_enqueue_scripts', function ( $hook ) {

    // Load ONLY on our plugin page
    if ( $hook !== 'toplevel_page_scgs-admin' ) {
        return;
    }

    // Allow Admin, Teacher, Manager
    if ( ! current_user_can( 'scgs_view_students' ) ) {
        return;
    }

    wp_enqueue_script(
        'scgs-admin-react',
        SCGS_URL . 'build/index.js',
        [ 'wp-element' ],
        time(),
        true
    );

    wp_localize_script(
        'scgs-admin-react',
        'SCGS_DATA',
        [
            'apiUrl' => rest_url( 'scgs/v1' ),
            'nonce'  => wp_create_nonce( 'wp_rest' ),
            'canManageStudents' => current_user_can( 'scgs_manage_students' ),
        ]
    );

});

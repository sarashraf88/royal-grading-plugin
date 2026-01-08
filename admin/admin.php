<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Admin Menu
 */
add_action( 'admin_menu', 'scgs_register_admin_menu' );

function scgs_register_admin_menu() {
    add_menu_page(
        'School Certificates',
        'School Certificates',
        'scgs_view_students',        // MUST be view capability
        'scgs-admin',                // Page slug
        'scgs_render_admin_page',    // Callback
        'dashicons-welcome-learn-more',
        25
    );
}

/**
 * Enqueue React assets for admin page
 */
add_action( 'admin_enqueue_scripts', 'scgs_enqueue_admin_assets' );

function scgs_enqueue_admin_assets() {

    // Ensure we are on our plugin page
    $screen = get_current_screen();
    if ( ! $screen || $screen->id !== 'toplevel_page_scgs-admin' ) {
        return;
    }

    wp_enqueue_script(
        'scgs-admin-react',
        plugins_url( 'build/index.js', dirname( __FILE__ ) ),
        [ 'wp-element' ],
        filemtime( SCGS_PATH . 'build/index.js' ),
        true
    );

    wp_localize_script(
        'scgs-admin-react',
        'SCGS_DATA',
        [
            'apiUrl' => rest_url( 'scgs/v1' ),
            'nonce'  => wp_create_nonce( 'wp_rest' ),
            'canManageStudents' => current_user_can( 'scgs_manage_students' )
        ]
    );
}

/**
 * Render Admin Page
 */
function scgs_render_admin_page() {
    echo '<div class="wrap">';
    echo '<h1>School Certificates</h1>';
    echo '<div id="scgs-admin-root"></div>';
    echo '</div>';
}

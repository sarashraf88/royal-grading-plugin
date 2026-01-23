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
    'royal-admin-js',
    'royalPlugin',
    [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('scgs_nonce'),
        'modules'  => [
            'academicYear'   => plugin_dir_url(__FILE__) . '../assets/js/academic-year.js',
            'subjectGroups'  => plugin_dir_url(__FILE__) . '../assets/js/subject-groups.js',
            'subjects'       => plugin_dir_url(__FILE__) . '../assets/js/subjects.js',
            'subjectCriteria'=> plugin_dir_url(__FILE__) . '../assets/js/subject-criteria.js',
            'classes'        => plugin_dir_url(__FILE__) . '../assets/js/classes.js',
            'students'       => plugin_dir_url(__FILE__) . '../assets/js/students.js',
            'grades'         => plugin_dir_url(__FILE__) . '../assets/js/grades.js',
        ],
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

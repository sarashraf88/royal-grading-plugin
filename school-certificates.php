<?php
/**
 * Plugin Name: Royal Plugin
 * Description: School grading and certificates system.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Load required files
 * IMPORTANT: ajax-handlers MUST be loaded unconditionally
 */
require_once plugin_dir_path( __FILE__ ) . 'includes/install.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/admin-menu.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/ajax-handlers.php';

/**
 * Plugin activation
 */
register_activation_hook( __FILE__, 'scgs_install_tables' );

/**
 * Enqueue admin assets (NO hook filtering)
 */
add_action( 'admin_enqueue_scripts', function () {

    wp_enqueue_style(
        'royal-admin-css',
        plugin_dir_url( __FILE__ ) . 'assets/admin.css',
        [],
        '1.0.0'
    );

    wp_enqueue_script(
    'royal-admin-js',
    plugin_dir_url(__FILE__) . 'assets/js/admin.js',
    ['jquery'],
    '1.0.0',
    true
);


wp_localize_script(
    'royal-admin-js', // ✅ MUST match enqueue handle
    'royalPlugin',    // ✅ JS object used in admin.js
    [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('scgs_nonce'),
        'modules'  => [
            'grades'           => plugin_dir_url(__FILE__) . 'assets/js/grades.js',
            'subjectGroups'    => plugin_dir_url(__FILE__) . 'assets/js/subject-groups.js',
            'subjects'         => plugin_dir_url(__FILE__) . 'assets/js/subjects.js',
            'classes'          => plugin_dir_url(__FILE__) . 'assets/js/classes.js',
            'students'         => plugin_dir_url(__FILE__) . 'assets/js/students.js',
            'subjectCriteria'  => plugin_dir_url(__FILE__) . 'assets/js/subject-criteria.js',
            'academicYear'     => plugin_dir_url(__FILE__) . 'assets/js/academic-year.js',
        ]
    ]
);



});

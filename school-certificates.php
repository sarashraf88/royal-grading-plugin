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
        plugin_dir_url( __FILE__ ) . 'assets/index.js',
        [ 'jquery' ],
        '1.0.0',
        true
    );

    wp_localize_script(
        'royal-admin-js',
        'SCGS_DATA',
        [
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'scgs_nonce' ),
        ]
    );
});

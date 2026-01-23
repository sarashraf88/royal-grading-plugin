<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * ==================================================
 * GLOBAL SECURITY CHECK
 * ==================================================
 */
function scgs_check_permissions() {

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( [ 'message' => 'Insufficient permissions' ] );
    }

    if ( empty( $_POST['nonce'] ) ) {
        wp_send_json_error( [ 'message' => 'Nonce missing' ] );
    }

    if ( ! wp_verify_nonce( $_POST['nonce'], 'scgs_nonce' ) ) {
        wp_send_json_error( [ 'message' => 'Invalid nonce' ] );
    }
}

/**
 * ===================================
 * AJAX HANDLERS LOADER
 * ===================================
 */

require_once __DIR__ . '/ajax/academic-years.php';
require_once __DIR__ . '/ajax/classes.php';
require_once __DIR__ . '/ajax/subjects.php';
require_once __DIR__ . '/ajax/subject-groups.php';
require_once __DIR__ . '/ajax/subject-criteria.php';
require_once __DIR__ . '/ajax/students.php';
require_once __DIR__ . '/ajax/students-import-export.php';
require_once __DIR__ . '/ajax/student-subjects.php';
require_once __DIR__ . '/ajax/grades.php';



<?php
/**
 * Students REST API
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Students REST routes
 */
add_action( 'rest_api_init', function () {

    register_rest_route( 'scgs/v1', '/students', [

        // -------------------------
        // GET /students (View)
        // -------------------------
        [
            'methods'  => WP_REST_Server::READABLE,
            'callback' => 'scgs_api_get_students',
            'permission_callback' => function () {
                return current_user_can( 'scgs_view_students' );
            },
        ],

        // -------------------------
        // POST /students (Create)
        // -------------------------
        [
            'methods'  => WP_REST_Server::CREATABLE,
            'callback' => 'scgs_api_create_student',
            'permission_callback' => function () {
                return current_user_can( 'scgs_manage_students' );
            },
        ],

    ] );

} );

/**
 * GET /students
 */
function scgs_api_get_students() {
    global $wpdb;

    $students = $wpdb->get_results(
        "SELECT 
            id, 
            student_code, 
            first_name, 
            last_name, 
            grade_level, 
            class_section
         FROM {$wpdb->prefix}scgs_students"
    );

    return rest_ensure_response( $students );
}

/**
 * POST /students
 */
function scgs_api_create_student( WP_REST_Request $request ) {
    global $wpdb;

    $data = $request->get_json_params();

    // Validation
    if (
        empty( $data['student_code'] ) ||
        empty( $data['first_name'] ) ||
        empty( $data['last_name'] )
    ) {
        return new WP_Error(
            'missing_fields',
            'student_code, first_name, and last_name are required',
            [ 'status' => 400 ]
        );
    }

    $wpdb->insert(
        $wpdb->prefix . 'scgs_students',
        [
            'student_code'  => sanitize_text_field( $data['student_code'] ),
            'first_name'    => sanitize_text_field( $data['first_name'] ),
            'last_name'     => sanitize_text_field( $data['last_name'] ),
            'grade_level'   => sanitize_text_field( $data['grade_level'] ?? '' ),
            'class_section' => sanitize_text_field( $data['class_section'] ?? '' ),
        ],
        [ '%s', '%s', '%s', '%s', '%s' ]
    );

    return rest_ensure_response( [
        'id'            => $wpdb->insert_id,
        'student_code'  => $data['student_code'],
        'first_name'    => $data['first_name'],
        'last_name'     => $data['last_name'],
        'grade_level'   => $data['grade_level'] ?? '',
        'class_section' => $data['class_section'] ?? '',
    ] );
}

<?php
/**
 * Subjects REST API (Group-aware, GET only)
 */
error_log( 'SCGS Subjects API loaded' );

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Subjects REST route
 */
add_action( 'rest_api_init', function () {

   register_rest_route( 'scgs/v1', '/subjects', [
    'methods'  => WP_REST_Server::READABLE,
    'callback' => 'scgs_api_get_subjects',
    'permission_callback' => function () {
        
    $user = wp_get_current_user();

    error_log(
        'USER: ' . $user->user_login .
        ' | ROLE: ' . implode( ',', $user->roles ) .
        ' | HAS scgs_view_subjects: ' .
        ( current_user_can( 'scgs_view_subjects' ) ? 'YES' : 'NO' )
    );

    return current_user_can( 'scgs_view_subjects' );
},

] );


} );

/**
 * GET /subjects
 * Returns subjects with optional group info
 */
function scgs_api_get_subjects() {
    global $wpdb;

    $subjects_table = $wpdb->prefix . 'scgs_subjects';
    $groups_table   = $wpdb->prefix . 'scgs_subject_groups';
    $items_table    = $wpdb->prefix . 'scgs_subject_group_items';

    $results = $wpdb->get_results(
        "
        SELECT 
            s.id,
            s.name,
            s.grade_level,
            s.credit_type,
            g.id AS group_id,
            g.name AS group_name,
            g.is_required
        FROM $subjects_table s
        LEFT JOIN $items_table gi ON gi.subject_id = s.id
        LEFT JOIN $groups_table g ON g.id = gi.group_id
        ORDER BY s.grade_level, s.name
        "
    );

    $subjects = [];

    foreach ( $results as $row ) {

        $subjects[] = [
            'id'          => (int) $row->id,
            'name'        => $row->name,
            'grade_level' => $row->grade_level,
            'credit_type' => $row->credit_type,
            'group'       => $row->group_id ? [
                'id'          => (int) $row->group_id,
                'name'        => $row->group_name,
                'is_required' => (int) $row->is_required,
            ] : null,
        ];
    }

    return rest_ensure_response( $subjects );
}

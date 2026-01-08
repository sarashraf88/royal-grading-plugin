<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function scgs_register_roles_and_capabilities() {

    // ---------- Admin ----------
    if ( $admin = get_role( 'administrator' ) ) {
        $caps = [
            'scgs_view_students',
            'scgs_manage_students',
            'scgs_view_classes',
            'scgs_manage_classes',
            'scgs_view_subjects',
            'scgs_manage_subjects',
            'scgs_assign_teachers',
            'scgs_enter_grades',
            'scgs_view_all_grades',
            'scgs_print_certificates',
            'scgs_manage_settings',
        ];

        foreach ( $caps as $cap ) {
            $admin->add_cap( $cap );
        }
    }

    // ---------- Teacher ----------
    $teacher = get_role( 'scgs_teacher' );
    if ( ! $teacher ) {
        $teacher = add_role( 'scgs_teacher', 'Teacher', [ 'read' => true ] );
    }

    foreach ( [
        'scgs_view_students',
        'scgs_view_classes',
        'scgs_view_subjects',
        'scgs_enter_grades',
    ] as $cap ) {
        $teacher->add_cap( $cap );
    }

    // ---------- Manager ----------
    $manager = get_role( 'scgs_manager' );
    if ( ! $manager ) {
        $manager = add_role( 'scgs_manager', 'Manager', [ 'read' => true ] );
    }

    foreach ( [
        'scgs_view_students',
        'scgs_view_classes',
        'scgs_view_subjects',
        'scgs_view_all_grades',
        'scgs_print_certificates',
    ] as $cap ) {
        $manager->add_cap( $cap );
    }
}

// 🔴 DEV FIX — force-attach caps to existing users
add_action( 'init', function () {

    if ( ! is_user_logged_in() ) {
        return;
    }

    $user = wp_get_current_user();

    if ( in_array( 'scgs_teacher', $user->roles, true ) ||
         in_array( 'scgs_manager', $user->roles, true ) ) {

        $caps = [
            'scgs_view_students',
            'scgs_view_classes',
            'scgs_view_subjects',
        ];

        foreach ( $caps as $cap ) {
            $user->add_cap( $cap );
        }
    }
}, 1 );


<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'admin_menu', 'scgs_register_admin_menu' );

function scgs_register_admin_menu() {

   
    add_menu_page(
        'School Grading System',
        'School Grading',
        'manage_options',
        'scgs-dashboard',
        'scgs_dashboard_page',
        'dashicons-welcome-learn-more',
        25
    );

    add_submenu_page(
        'scgs-dashboard',
        'Subjects',
        'Subjects',
        'manage_options',
        'scgs-subjects',
        'scgs_subjects_page'
    );

    add_submenu_page(
        'scgs-dashboard',
        'Subject Groups',
        'Subject Groups',
        'manage_options',
        'scgs-subject-groups',
        'scgs_subject_groups_page'
    );

    add_submenu_page(
        'scgs-dashboard',
        'Classes',
        'Classes',
        'manage_options',
        'scgs-classes',
        'scgs_classes_page'
    );

    add_submenu_page(
        'scgs-dashboard',
        'Students',
        'Students',
        'manage_options',
        'scgs-students',
        'scgs_students_page'
    );
    add_submenu_page(
    'scgs-dashboard',
    'Subject Criteria',
    'Subject Criteria',
    'manage_options',
    'scgs-subject-criteria',
    'scgs_subject_criteria_page'
);

add_submenu_page(
    'scgs-dashboard',
    'Academic Years',
    'Academic Years',
    'manage_options',
    'scgs-academic-years',
    'scgs_academic_years_page'
);


}

function scgs_dashboard_page() {
    echo '<div class="wrap"><h1>School Grading System</h1></div>';
}

function scgs_subjects_page() {
    echo '<div class="wrap"><h1>Subjects</h1><div id="scgs-subjects-root"></div></div>';
}

function scgs_subject_groups_page() {
    echo '<div class="wrap"><h1>Subject Groups</h1><div id="scgs-subject-groups-root"></div></div>';
}

function scgs_classes_page() {
    echo '<div class="wrap"><h1>Classes</h1><div id="scgs-classes-root"></div></div>';
}

function scgs_students_page() {
    echo '<div class="wrap"><h1>Students</h1><div id="scgs-students-root"></div></div>';
}
function scgs_subject_criteria_page() {
     echo '<div class="wrap"><h1>Subject Criteria</h1><div id="scgs-subject-criteria-root"></div></div>';
}
function scgs_academic_years_page() {
      echo '<div class="wrap"><h1>Academic Years</h1><div id="scgs-academic-years-root"></div></div>';
 }


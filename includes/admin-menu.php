<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'admin_menu', 'scgs_register_admin_menu' );

function scgs_register_admin_menu() {

    /**
     * MAIN MENU
     */
    add_menu_page(
        'School Grading System',
        'School Grading',
        'manage_options',
        'scgs-dashboard',
        'scgs_dashboard_page',
        'dashicons-welcome-learn-more',
        25
    );

      /**
     * ACADEMIC YEARS
     */
    add_submenu_page(
        'scgs-dashboard',
        'Academic Years',
        'Academic Years',
        'manage_options',
        'scgs-academic-years',
        'scgs_academic_years_page'
    );

    /**
     * GRADES (NEW – MUST BE FIRST)
     */
add_submenu_page(
    'scgs-dashboard',
    'Grades',
    'Grades',
    'manage_options',
    'scgs-grades',
    'scgs_grades_page'
);  
  

    /**
     * SUBJECT GROUPS
     */
    add_submenu_page(
        'scgs-dashboard',
        'Subject Groups',
        'Subject Groups',
        'manage_options',
        'scgs-subject-groups',
        'scgs_subject_groups_page'
    );

    /**
     * SUBJECTS
     */
    add_submenu_page(
        'scgs-dashboard',
        'Subjects',
        'Subjects',
        'manage_options',
        'scgs-subjects',
        'scgs_subjects_page'
    );

    /**
     * SUBJECT CRITERIA
     */
    add_submenu_page(
        'scgs-dashboard',
        'Subject Criteria',
        'Subject Criteria',
        'manage_options',
        'scgs-subject-criteria',
        'scgs_subject_criteria_page'
    );

    /**
     * CLASSES
     */
    add_submenu_page(
        'scgs-dashboard',
        'Classes',
        'Classes',
        'manage_options',
        'scgs-classes',
        'scgs_classes_page'
    );

    /**
     * STUDENTS
     */
    add_submenu_page(
        'scgs-dashboard',
        'Students',
        'Students',
        'manage_options',
        'scgs-students',
        'scgs_students_page'
    );
}

/**
 * DASHBOARD
 */
function scgs_dashboard_page() {
    echo '<div class="wrap"><h1>School Grading System</h1></div>';
}

/**
 * GRADES (NEW)
 */
function scgs_grades_page() {
    echo '<div class="wrap"><h1>Grades</h1><div id="scgs-grades-root"></div></div>';
}

/**
 * ACADEMIC YEARS
 */
function scgs_academic_years_page() {
    echo '<div class="wrap"><h1>Academic Years</h1><div id="scgs-academic-year-root"></div></div>';
}

/**
 * SUBJECT GROUPS
 */
function scgs_subject_groups_page() {
    echo '<div class="wrap"><h1>Subject Groups</h1><div id="scgs-subject-groups-root"></div></div>';
}

/**
 * SUBJECTS
 */
function scgs_subjects_page() {
    echo '<div class="wrap"><h1>Subjects</h1><div id="scgs-subjects-root"></div></div>';
}

/**
 * SUBJECT CRITERIA
 */
function scgs_subject_criteria_page() {
    echo '<div class="wrap"><h1>Subject Criteria</h1><div id="scgs-subject-criteria-root"></div></div>';
}

/**
 * CLASSES
 */
function scgs_classes_page() {
    echo '<div class="wrap"><h1>Classes</h1><div id="scgs-classes-root"></div></div>';
}

/**
 * STUDENTS
 */
function scgs_students_page() {
    echo '<div class="wrap"><h1>Students</h1><div id="scgs-students-root"></div></div>';
}


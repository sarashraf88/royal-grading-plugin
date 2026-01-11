<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Create / update database tables on plugin activation
 * IMPORTANT: This file must produce ZERO output
 */
function scgs_install_tables() {
    global $wpdb;

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    $charset_collate = $wpdb->get_charset_collate();
     
    /**
     * Academic Years
     */
      $table = $wpdb->prefix . 'scgs_academic_years';
    $charset = $wpdb->get_charset_collate();

    $sql_academic_years = "CREATE TABLE $table (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        is_active TINYINT(1) DEFAULT 0,
        PRIMARY KEY (id)
    ) $charset;";

    /**
     * Subject Groups
     */
    $table_subject_groups = $wpdb->prefix . 'scgs_subject_groups';

    $sql_subject_groups = "
    CREATE TABLE $table_subject_groups (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        grade_level VARCHAR(20) NOT NULL,
        is_required TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;
    ";

    /**
     * Subjects
     */
    $table_subjects = $wpdb->prefix . 'scgs_subjects';

            $sql_subjects = 
            "CREATE TABLE {$wpdb->prefix}scgs_subjects (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            subject_group_id BIGINT UNSIGNED NULL,
            max_score INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY subject_group_id (subject_group_id)
            ) $charset_collate;";
        /**
         * Subject Criteria (by Grade + Academic Year)
         */
        $table_criteria = $wpdb->prefix . 'scgs_subject_criteria';

        $sql_criteria = "
        CREATE TABLE $table_criteria (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            subject_id BIGINT UNSIGNED NOT NULL,
            grade_level VARCHAR(20) NOT NULL,
            academic_year_id BIGINT UNSIGNED NOT NULL,
            has_assessment TINYINT(1) DEFAULT 1,
            weekly_weight DECIMAL(5,2) NOT NULL,
            assessment_weight DECIMAL(5,2) NOT NULL,
            final_weight DECIMAL(5,2) NOT NULL,
            credit_type VARCHAR(20) NOT NULL DEFAULT 'credit',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY subject_grade_year (subject_id, grade_level, academic_year_id)
        ) $charset_collate;
        ";
    /**
     * Classes
     */
    $table_classes = $wpdb->prefix . 'scgs_classes';

    $sql_classes = "
    CREATE TABLE $table_classes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        grade_level VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;
    ";

    /**
     * Students
     */
   /**
 * Students (FINAL SCHEMA)
 */
$table_students = $wpdb->prefix . 'scgs_students';

$sql_students = "
CREATE TABLE $table_students (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50) NULL,
    date_of_birth DATE NULL,
    student_email VARCHAR(100) NULL,
    class_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY student_code (student_code),
    UNIQUE KEY student_email (student_email),
    KEY class_id (class_id)
) $charset_collate;
";

/**
 * Student Parent Emails
 */
$table_parents = $wpdb->prefix . 'scgs_student_parents';

$sql_parents = "
CREATE TABLE $table_parents (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY student_parent_email (student_id, email),
    KEY student_id (student_id)
) $charset_collate;
";

    dbDelta( $sql_subject_groups );
    dbDelta( $sql_subjects );
    dbDelta( $sql_classes );
    dbDelta( $sql_students );
    dbDelta( $sql_parents );
    dbDelta($sql_academic_years);
    dbDelta( $sql_criteria );


    
}

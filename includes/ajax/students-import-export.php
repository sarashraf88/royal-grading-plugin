<?php
if ( ! defined('ABSPATH') ) exit;

/**
 * ==================================================
 * STUDENTS — CSV EXPORT
 * ==================================================
 */
add_action('wp_ajax_scgs_export_students', 'scgs_export_students');
function scgs_export_students() {

    // 🔒 Manual nonce check for GET requests
    if (
        empty($_GET['nonce']) ||
        ! wp_verify_nonce($_GET['nonce'], 'scgs_nonce')
    ) {
        wp_send_json_error(['message' => 'Invalid nonce']);
    }

    //scgs_check_permissions();
    global $wpdb;

    $students = $wpdb->prefix . 'scgs_students';
    $classes  = $wpdb->prefix . 'scgs_classes';

    $rows = $wpdb->get_results("
        SELECT
            s.student_code,
            s.first_name,
            s.last_name,
            s.nationality,
            s.date_of_birth,
            s.student_email,
            c.name AS class_name
        FROM $students s
        LEFT JOIN $classes c ON s.class_id = c.id
        ORDER BY s.id ASC
    ", ARRAY_A);

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename=students.csv');

    $output = fopen('php://output', 'w');

    fputcsv($output, [
        'student_code',
        'first_name',
        'last_name',
        'nationality',
        'date_of_birth',
        'student_email',
        'class_name'
    ]);

    foreach ($rows as $row) {
        fputcsv($output, $row);
    }

    fclose($output);
    exit;
}


/**
 * ==================================================
 * STUDENTS — CSV IMPORT
 * ==================================================
 */
add_action('wp_ajax_scgs_import_students', 'scgs_import_students');
function scgs_import_students() {
    scgs_check_permissions();
    global $wpdb;

    if ( empty($_FILES['file']['tmp_name']) ) {
        wp_send_json_error(['message' => 'No file uploaded']);
    }

    $students = $wpdb->prefix . 'scgs_students';
    $classes  = $wpdb->prefix . 'scgs_classes';

    $handle = fopen($_FILES['file']['tmp_name'], 'r');
    if (!$handle) {
        wp_send_json_error(['message' => 'Cannot read file']);
    }

    $header = fgetcsv($handle); // skip header
    $inserted = 0;

    while (($row = fgetcsv($handle)) !== false) {

        [
            $student_code,
            $first_name,
            $last_name,
            $nationality,
            $date_of_birth,
            $student_email,
            $class_name
        ] = array_map('trim', $row);

        if (!$student_code || !$first_name || !$last_name || !$class_name) {
            continue;
        }

        // Resolve class_id by class name
        $class_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM $classes WHERE name = %s",
                $class_name
            )
        );

        if (!$class_id) continue;

        $wpdb->insert($students, [
            'student_code'  => $student_code,
            'first_name'    => $first_name,
            'last_name'     => $last_name,
            'nationality'   => $nationality ?: null,
            'date_of_birth' => $date_of_birth ?: null,
            'student_email' => $student_email ?: null,
            'class_id'      => $class_id,
        ]);

        if ($wpdb->insert_id) {
            $inserted++;
        }
    }

    fclose($handle);

    wp_send_json_success([
        'message' => "Imported {$inserted} students"
    ]);
}

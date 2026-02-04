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

    $ids = [];

        if (!empty($_GET['ids'])) {
            $ids = array_filter(
                array_map('intval', explode(',', $_GET['ids']))
            );
        }

   

    //scgs_check_permissions();
    global $wpdb;

    $students = $wpdb->prefix . 'scgs_students';
    $classes  = $wpdb->prefix . 'scgs_classes';
    $ids = [];
if (!empty($_GET['ids'])) {
    $ids = array_map('intval', explode(',', $_GET['ids']));
}

        $where = '';

        if (!empty($ids)) {
            $where = 'WHERE s.id IN (' . implode(',', $ids) . ')';
        }


        $rows = $wpdb->get_results("
            SELECT
                s.student_code,
                s.first_name,
                s.last_name,
                s.nationality,
                s.date_of_birth,
                s.student_email,
                c.name AS class_id
            FROM $students s
            LEFT JOIN $classes c ON s.class_id = c.id
            $where
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
        'class_id'
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

    // 🔒 Same nonce logic as export
    if (
        empty($_POST['nonce']) ||
        !wp_verify_nonce($_POST['nonce'], 'scgs_nonce')
    ) {
        wp_send_json_error(['message' => 'Invalid nonce']);
    }

    scgs_check_permissions();
    global $wpdb;

    if (empty($_FILES['file']['tmp_name'])) {
        wp_send_json_error(['message' => 'No file uploaded']);
    }

    $students = $wpdb->prefix . 'scgs_students';
    $classes  = $wpdb->prefix . 'scgs_classes';

    $handle = fopen($_FILES['file']['tmp_name'], 'r');
    if (!$handle) {
        wp_send_json_error(['message' => 'Cannot read CSV file']);
    }

    // Detect delimiter (comma or semicolon)
    $firstLine = fgets($handle);
    rewind($handle);
    $delimiter = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';

    // Skip header
    fgetcsv($handle, 0, $delimiter);

    $inserted = 0;
    $updated  = 0;
    $skipped  = 0;

    while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {

        $row = array_pad($row, 7, null);
        $row = array_map('trim', $row);

        [
            $student_code,
            $first_name,
            $last_name,
            $nationality,
            $date_of_birth,
            $student_email,
            $class_name   // IMPORTANT: this is CLASS NAME, not ID
        ] = $row;

        // Required fields
        if (!$student_code || !$first_name || !$last_name || !$class_name) {
            $skipped++;
            continue;
        }

        // --------------------------------------------------
        // Resolve class_id from class NAME (same as export)
        // --------------------------------------------------
        $class_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM $classes WHERE name = %s",
                $class_name
            )
        );

        if (!$class_id) {
            $skipped++;
            continue;
        }

        // --------------------------------------------------
        $dob = null;

            if (!empty($date_of_birth)) {

                $date_of_birth = trim($date_of_birth);

                foreach (['Y-m-d', 'd/m/Y', 'd-m-Y', 'Y/m/d'] as $fmt) {

                    $dt = DateTime::createFromFormat($fmt, $date_of_birth);

                    if ($dt !== false) {
                        $dob = $dt->format('Y-m-d');
                        break;
                    }
                }
            }


        // --------------------------------------------------
        // Check existing student by student_code
        // --------------------------------------------------
        $existing_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM $students WHERE student_code = %s",
                $student_code
            )
        );

        if ($existing_id) {

            // UPDATE
            $wpdb->update(
                $students,
                [
                    'first_name'    => $first_name,
                    'last_name'     => $last_name,
                    'nationality'   => $nationality,
                    'date_of_birth' => $dob,
                    'student_email' => $student_email,
                    'class_id'      => (int)$class_id,
                ],
                ['id' => $existing_id]
            );

            $updated++;

        } else {

            // INSERT
            $result = $wpdb->insert(
                $students,
                [
                    'student_code'  => $student_code,
                    'first_name'    => $first_name,
                    'last_name'     => $last_name,
                    'nationality'   => $nationality,
                    'date_of_birth' => $dob,
                    'student_email' => $student_email,
                    'class_id'      => (int)$class_id,
                ]
            );

            if ($result) {
                $inserted++;
            } else {
                $skipped++;
            }
        }
    }

    fclose($handle);

    wp_send_json_success([
        'message' => "Import finished. Inserted: $inserted, Updated: $updated, Skipped: $skipped"
    ]);
}


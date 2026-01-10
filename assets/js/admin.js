/**
 * ======================================================
 * ROYAL PLUGIN — ADMIN JS LOADER (FINAL)
 * ======================================================
 * Loads ONLY the JS module needed for the current admin page.
 *
 * Requirements:
 * - jQuery loaded
 * - royalPlugin object localized from PHP
 * - Each admin page has a unique root div
 * ======================================================
 */

jQuery(document).ready(function ($) {

    if (typeof royalPlugin === 'undefined') {
        console.error('royalPlugin object is missing. Check wp_localize_script.');
        return;
    }

    // --------------------------------------------------
    // SUBJECT GROUPS
    // --------------------------------------------------
    if ($('#scgs-subject-groups-root').length) {
        console.log('Loading Subject Groups module');
        $.getScript(royalPlugin.modules.subjectGroups)
            .fail(() => console.error('Failed to load subject-groups.js'));
        return;
    }

    // --------------------------------------------------
    // SUBJECTS
    // --------------------------------------------------
    if ($('#scgs-subjects-root').length) {
        console.log('Loading Subjects module');
        $.getScript(royalPlugin.modules.subjects)
            .fail(() => console.error('Failed to load subjects.js'));
        return;
    }

    // --------------------------------------------------
    // CLASSES
    // --------------------------------------------------
    if ($('#scgs-classes-root').length) {
        console.log('Loading Classes module');
        $.getScript(royalPlugin.modules.classes)
            .fail(() => console.error('Failed to load classes.js'));
        return;
    }

    // --------------------------------------------------
    // STUDENTS
    // --------------------------------------------------
    if ($('#scgs-students-root').length) {
        console.log('Loading Students module');
        $.getScript(royalPlugin.modules.students)
            .fail(() => console.error('Failed to load students.js'));
        return;
    }

    // --------------------------------------------------
    // SUBJECT CRITERIA
    // --------------------------------------------------
    if ($('#scgs-subject-criteria-root').length) {
        console.log('Loading Subject Criteria module');
        $.getScript(royalPlugin.modules.subjectCriteria)
            .fail(() => console.error('Failed to load subject-criteria.js'));
        return;
    }

    // --------------------------------------------------
    // ACADEMIC YEAR
    // --------------------------------------------------
    if ($('#scgs-academic-year-root').length) {
        console.log('Loading Academic Year module');
        $.getScript(royalPlugin.modules.academicYear)
            .fail(() => console.error('Failed to load academic-year.js'));
        return;
    }

    // --------------------------------------------------
    // FALLBACK
    // --------------------------------------------------
    console.warn('Royal Plugin admin.js loaded, but no known page root was detected.');

});

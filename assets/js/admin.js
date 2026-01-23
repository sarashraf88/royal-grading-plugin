jQuery(document).ready(function ($) {

    if (typeof royalPlugin === 'undefined') {
        console.error('royalPlugin object is missing. Check wp_localize_script.');
        return;
    }

    function load(moduleKey, label) {
        const url = royalPlugin.modules?.[moduleKey];

        if (!url) {
            console.error(`Module "${moduleKey}" is not defined`);
            return;
        }

        console.log(`Loading module: ${label}`);
        $.getScript(url)
            .done(() => console.log(`${label} module loaded`))
            .fail(() => console.error(`Failed to load ${label}`));
    }

    if ($('#scgs-grades-root').length) {
        load('grades', 'Grades');
        return;
    }

    if ($('#scgs-subject-groups-root').length) {
        load('subjectGroups', 'Subject Groups');
        return;
    }

    if ($('#scgs-subjects-root').length) {
        load('subjects', 'Subjects');
        return;
    }

    if ($('#scgs-classes-root').length) {
        load('classes', 'Classes');
        return;
    }

    if ($('#scgs-students-root').length) {
        load('students', 'Students');
        return;
    }

    if ($('#scgs-subject-criteria-root').length) {
        load('subjectCriteria', 'Subject Criteria');
        return;
    }

    if ($('#scgs-academic-year-root').length) {
        load('academicYear', 'Academic Year');
        return;
    }

    console.warn('Admin page loaded but no known root detected');
});

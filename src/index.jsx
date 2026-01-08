import { render, useState, useEffect } from '@wordpress/element';
console.log('SCGS JS LOADED');

function App() {
    /* --------------------------------------------------
     * Permissions (from wp_localize_script)
     * -------------------------------------------------- */
    const canManageStudents = SCGS_DATA?.canManageStudents ?? false;

    /* --------------------------------------------------
     * State
     * -------------------------------------------------- */
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /* --------------------------------------------------
     * Safe API fetch helper
     * -------------------------------------------------- */
    const fetchApi = async (endpoint) => {
        const response = await fetch(`${SCGS_DATA.apiUrl}/${endpoint}`, {
            method: 'GET',
            headers: {
                'X-WP-Nonce': SCGS_DATA.nonce,
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
        });

        const text = await response.text();

        if (!response.ok) {
            console.error(`API error (${endpoint}):`, text);
            throw new Error(`Failed to load ${endpoint}`);
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error(`Non-JSON response from ${endpoint}:`, text);
            throw e;
        }
    };

    /* --------------------------------------------------
     * Load data on first render
     * -------------------------------------------------- */
    useEffect(() => {
        async function loadData() {
            try {
                const [studentsData, classesData, subjectsData] =
                    await Promise.all([
                        fetchApi('students'),
                        fetchApi('classes'),
                        fetchApi('subjects'),
                    ]);

                setStudents(Array.isArray(studentsData) ? studentsData : []);
                setClasses(Array.isArray(classesData) ? classesData : []);
                setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    /* --------------------------------------------------
     * Render
     * -------------------------------------------------- */
    return (
        <div className="wrap scgs-admin">
            <h1>School Certificates</h1>

            {error && (
                <div className="notice notice-error">
                    <p>{error}</p>
                </div>
            )}

            {loading && <p>Loading data…</p>}

            {/* ===================== STUDENTS ===================== */}
            <h2>Students</h2>
            {students.length === 0 ? (
                <p>No students found.</p>
            ) : (
                <table className="widefat striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Code</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.student_code}</td>
                                <td>{s.first_name}</td>
                                <td>{s.last_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <hr />

            {/* ===================== CLASSES ===================== */}
            <h2>Classes</h2>
            {classes.length === 0 ? (
                <p>No classes found.</p>
            ) : (
                <table className="widefat striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Grade Level</th>
                            <th>Section</th>
                            <th>Students Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((c) => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.grade_level}</td>
                                <td>{c.section}</td>
                                <td>{c.students_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <hr />

            {/* ===================== SUBJECTS ===================== */}
            <h2>Subjects</h2>
            {subjects.length === 0 ? (
                <p>No subjects found.</p>
            ) : (
                <table className="widefat striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Grade</th>
                            <th>Credit Type</th>
                            <th>Group</th>
                            <th>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.name}</td>
                                <td>{s.grade_level}</td>
                                <td>{s.credit_type}</td>
                                <td>{s.group_name || '-'}</td>
                                <td>{s.is_required ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

/* --------------------------------------------------
 * Mount React app
 * -------------------------------------------------- */
const root = document.getElementById('scgs-admin-root');

if (root) {
    render(<App />, root);
}

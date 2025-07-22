console.log('Script JS sudah termuat!');
document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');

    // --- Project Form Elements (PASTIKAN DI ATAS renderAllProjects) ---
    const addProjectBtn = document.getElementById('addProjectBtn');
    const projectForm = document.getElementById('projectForm');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const projectsGrid = document.querySelector('.projects-grid');
    const lihatProyekBtn = document.querySelector('.btn-lihat-proyek');

    function showSection(sectionId) {
        pageSections.forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = e.target.dataset.section;
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });

    // --- Navigasi awal: selalu ke home saat refresh, apapun hash di URL ---
    showSection('home');
    setTimeout(() => history.replaceState(null, '', window.location.pathname), 0);

    // --- LocalStorage Helper ---
    function saveProjectsToStorage(projects) {
        localStorage.setItem('myProjects', JSON.stringify(projects));
    }
    function loadProjectsFromStorage() {
        return JSON.parse(localStorage.getItem('myProjects') || '[]');
    }

    // --- Render Projects from Storage on Load ---
    function renderAllProjects() {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = '';
        const projects = loadProjectsFromStorage();
        projects.forEach((proj, idx) => {
            const card = createProjectCard({ ...proj, idx });
            projectsGrid.appendChild(card);
        });
    }
    renderAllProjects();

    // --- Project Form Logic ---
    if (addProjectBtn && projectForm) {
        addProjectBtn.onclick = function (e) {
            e.preventDefault();
            projectForm.classList.remove('hidden');
            addProjectBtn.classList.add('hidden');
        };
    }
    if (cancelProjectBtn && projectForm && addProjectBtn) {
        cancelProjectBtn.onclick = function (e) {
            e.preventDefault();
            projectForm.classList.add('hidden');
            addProjectBtn.classList.remove('hidden');
            projectForm.reset();
            projectForm.onsubmit = defaultProjectFormSubmit;
        };
    }
    if (lihatProyekBtn) {
        lihatProyekBtn.onclick = function (e) {
            e.preventDefault();
            window.location.hash = 'projects';
            showSection('projects');
        };
    }

    // Fungsi untuk membuat elemen kartu proyek baru
    function createProjectCard({ title, desc, imgUrl, link, idx }) {
        const card = document.createElement('div');
        card.className = 'project-card';
        if (imgUrl) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = title;
            card.appendChild(img);
        }
        const h4 = document.createElement('h4');
        h4.textContent = title;
        card.appendChild(h4);
        const p = document.createElement('p');
        p.textContent = desc;
        card.appendChild(p);
        if (link) {
            const a = document.createElement('a');
            a.href = link;
            a.target = '_blank';
            a.textContent = 'Lihat Proyek';
            a.className = 'btn-primary';
            a.style.marginTop = '10px';
            card.appendChild(a);
        }
        // Tombol edit
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn-secondary edit-project-btn';
        editBtn.style.marginTop = '15px';
        editBtn.style.marginRight = '8px';
        editBtn.onclick = function () {
            document.getElementById('projectTitle').value = h4.textContent;
            document.getElementById('projectDesc').value = p.textContent;
            document.getElementById('projectLink').value = link || '';
            projectForm.classList.remove('hidden');
            addProjectBtn.classList.add('hidden');
            projectForm.onsubmit = function (e) {
                e.preventDefault();
                const newTitle = document.getElementById('projectTitle').value;
                const newDesc = document.getElementById('projectDesc').value;
                const newLink = document.getElementById('projectLink').value;
                const imgInput = document.getElementById('projectImg');
                let newImgUrl = imgUrl;
                if (imgInput && imgInput.files && imgInput.files[0]) {
                    // Simpan gambar baru ke localStorage sebagai dataURL
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        newImgUrl = ev.target.result;
                        updateProject(idx, { title: newTitle, desc: newDesc, imgUrl: newImgUrl, link: newLink });
                    };
                    reader.readAsDataURL(imgInput.files[0]);
                } else {
                    updateProject(idx, { title: newTitle, desc: newDesc, imgUrl: newImgUrl, link: newLink });
                }
            };
        };
        card.appendChild(editBtn);
        // Tombol hapus
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Hapus';
        delBtn.className = 'btn-secondary delete-project-btn';
        delBtn.style.marginTop = '15px';
        delBtn.onclick = function () {
            deleteProject(idx);
        };
        card.appendChild(delBtn);
        return card;
    }

    function updateProject(idx, newData) {
        const projects = loadProjectsFromStorage();
        projects[idx] = newData;
        saveProjectsToStorage(projects);
        renderAllProjects();
        projectForm.classList.add('hidden');
        addProjectBtn.classList.remove('hidden');
        projectForm.reset();
        projectForm.onsubmit = defaultProjectFormSubmit;
    }
    function deleteProject(idx) {
        const projects = loadProjectsFromStorage();
        projects.splice(idx, 1);
        saveProjectsToStorage(projects);
        renderAllProjects();
    }

    // Simpan handler submit default
    function defaultProjectFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('projectTitle').value;
        const desc = document.getElementById('projectDesc').value;
        const link = document.getElementById('projectLink').value;
        const imgInput = document.getElementById('projectImg');
        if (imgInput && imgInput.files && imgInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (ev) {
                const imgUrl = ev.target.result;
                addNewProject({ title, desc, imgUrl, link });
            };
            reader.readAsDataURL(imgInput.files[0]);
        } else {
            addNewProject({ title, desc, imgUrl: '', link });
        }
    }
    function addNewProject(proj) {
        const projects = loadProjectsFromStorage();
        projects.push(proj);
        saveProjectsToStorage(projects);
        renderAllProjects();
        projectForm.classList.add('hidden');
        addProjectBtn.classList.remove('hidden');
        projectForm.reset();
        projectForm.onsubmit = defaultProjectFormSubmit;
    }
    if (projectForm) {
        projectForm.onsubmit = defaultProjectFormSubmit;
    }
});
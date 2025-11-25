// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.users = [];
        this.maps = [];
        this.stats = {};
        this.init();
    }

    init() {
        this.checkAdminAuth();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    async checkAdminAuth() {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            
            if (!data.success) {
                window.location.href = '/login.html';
                return;
            }

            // Verificar se é admin (você pode implementar um campo isAdmin no modelo User)
            document.getElementById('admin-name').textContent = data.usuario.nome;
            
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            window.location.href = '/login.html';
        }
    }

    setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section) {
                    this.switchSection(section);
                }
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Search functionality
        document.getElementById('user-search').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        document.getElementById('maps-search').addEventListener('input', (e) => {
            this.filterMaps(e.target.value);
        });
    }

    switchSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update active section
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Update page title with cosmic themes
        const titles = {
            dashboard: '🌌 Cosmic Dashboard',
            users: '👥 Celestial Users',
            roles: '🏷️ User Roles',
            maps: '🗺️ Astral Maps',
            analytics: '🔭 Cosmic Analytics',
            events: '🌌 Planetary Events',
            settings: '⚙️ Cosmic Settings'
        };
        document.getElementById('page-title').textContent = titles[section] || 'Cosmic Portal';

        this.currentSection = section;

        // Load section data
        if (section === 'users') {
            this.loadUsers();
        } else if (section === 'roles') {
            this.loadRoles();
        } else if (section === 'maps') {
            this.loadMaps();
        } else if (section === 'analytics') {
            this.loadAnalytics();
        } else if (section === 'events') {
            this.loadEvents();
        }
    }

    async loadDashboardData() {
        this.showLoading();
        try {
            const [usersResponse, mapsResponse] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/maps')
            ]);

            const usersData = await usersResponse.json();
            const mapsData = await mapsResponse.json();

            if (usersData.success) {
                this.users = usersData.users;
                this.updateUserStats();
            }

            if (mapsData.success) {
                this.maps = mapsData.maps;
                this.updateMapStats();
            }

            this.createCharts();
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            this.hideLoading();
        }
    }

    updateUserStats() {
        const totalUsers = this.users.length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const newUsersToday = this.users.filter(user => {
            const userDate = new Date(user.criadoEm);
            return userDate >= today;
        }).length;

        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('new-users-today').textContent = newUsersToday;
    }

    updateMapStats() {
        const totalMaps = this.maps.length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const mapsToday = this.maps.filter(map => {
            const mapDate = new Date(map.criadoEm);
            return mapDate >= today;
        }).length;

        document.getElementById('total-maps').textContent = totalMaps;
        document.getElementById('maps-today').textContent = mapsToday;
    }

    createCharts() {
        this.createUsersChart();
        this.createMapsChart();
    }

    createUsersChart() {
        const ctx = document.getElementById('users-chart').getContext('2d');
        
        // Agrupar usuários por mês
        const monthlyUsers = this.groupByMonth(this.users, 'criadoEm');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyUsers.labels,
                datasets: [{
                    label: 'Cosmic Travelers',
                    data: monthlyUsers.data,
                    borderColor: '#EEDAA5',
                    backgroundColor: 'rgba(238, 218, 165, 0.2)',
                    pointBackgroundColor: '#8A5EFF',
                    pointBorderColor: '#EEDAA5',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#EEDAA5',
                            font: {
                                family: 'Orbitron',
                                weight: '600'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#C8CCD6',
                            font: { family: 'Inter' }
                        },
                        grid: { color: 'rgba(138, 94, 255, 0.2)' }
                    },
                    y: {
                        ticks: { 
                            color: '#C8CCD6',
                            font: { family: 'Inter' }
                        },
                        grid: { color: 'rgba(138, 94, 255, 0.2)' }
                    }
                }
            }
        });
    }

    createMapsChart() {
        const ctx = document.getElementById('maps-chart').getContext('2d');
        
        // Agrupar mapas por mês
        const monthlyMaps = this.groupByMonth(this.maps, 'criadoEm');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyMaps.labels,
                datasets: [{
                    label: 'Astral Readings',
                    data: monthlyMaps.data,
                    backgroundColor: 'rgba(138, 94, 255, 0.8)',
                    borderColor: '#8A5EFF',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#EEDAA5',
                            font: {
                                family: 'Orbitron',
                                weight: '600'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#C8CCD6',
                            font: { family: 'Inter' }
                        },
                        grid: { color: 'rgba(138, 94, 255, 0.2)' }
                    },
                    y: {
                        ticks: { 
                            color: '#C8CCD6',
                            font: { family: 'Inter' }
                        },
                        grid: { color: 'rgba(138, 94, 255, 0.2)' }
                    }
                }
            }
        });
    }

    groupByMonth(data, dateField) {
        const months = {};
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                           'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        data.forEach(item => {
            const date = new Date(item[dateField]);
            const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            months[monthKey] = (months[monthKey] || 0) + 1;
        });

        const labels = Object.keys(months).slice(-6); // Últimos 6 meses
        const values = labels.map(label => months[label] || 0);

        return { labels, data: values };
    }

    async loadUsers() {
        this.showLoading();
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            
            if (data.success) {
                this.users = data.users;
                this.renderUsersTable();
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderUsersTable() {
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${new Date(user.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td>${user.mapasCount || 0}</td>
                <td>
                    <button class="action-btn btn-view" onclick="adminPanel.viewUser('${user._id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="action-btn btn-delete" onclick="adminPanel.deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadMaps() {
        this.showLoading();
        try {
            const response = await fetch('/api/admin/maps');
            const data = await response.json();
            
            if (data.success) {
                this.maps = data.maps;
                this.renderMapsTable();
            }
        } catch (error) {
            console.error('Erro ao carregar mapas:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderMapsTable() {
        const tbody = document.getElementById('maps-tbody');
        tbody.innerHTML = '';

        this.maps.forEach(map => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${map.titulo}</td>
                <td>${map.usuario?.nome || 'N/A'}</td>
                <td>${map.dataNascimento.dia}/${map.dataNascimento.mes}/${map.dataNascimento.ano}</td>
                <td>${new Date(map.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="action-btn btn-view" onclick="adminPanel.viewMap('${map._id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="action-btn btn-delete" onclick="adminPanel.deleteMap('${map._id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterUsers(searchTerm) {
        const filteredUsers = this.users.filter(user => 
            user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';
        
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${new Date(user.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td>${user.mapasCount || 0}</td>
                <td>
                    <button class="action-btn btn-view" onclick="adminPanel.viewUser('${user._id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="action-btn btn-delete" onclick="adminPanel.deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterMaps(searchTerm) {
        const filteredMaps = this.maps.filter(map => 
            map.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (map.usuario?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const tbody = document.getElementById('maps-tbody');
        tbody.innerHTML = '';
        
        filteredMaps.forEach(map => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${map.titulo}</td>
                <td>${map.usuario?.nome || 'N/A'}</td>
                <td>${map.dataNascimento.dia}/${map.dataNascimento.mes}/${map.dataNascimento.ano}</td>
                <td>${new Date(map.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="action-btn btn-view" onclick="adminPanel.viewMap('${map._id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="action-btn btn-delete" onclick="adminPanel.deleteMap('${map._id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async viewUser(userId) {
        alert(`Visualizar usuário: ${userId}`);
        // Implementar modal ou página de detalhes do usuário
    }

    async deleteUser(userId) {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Usuário excluído com sucesso!');
                this.loadUsers();
                this.loadDashboardData();
            } else {
                alert('Erro ao excluir usuário: ' + data.error);
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário');
        }
    }

    async viewMap(mapId) {
        alert(`Visualizar mapa: ${mapId}`);
        // Implementar modal ou página de detalhes do mapa
    }

    async deleteMap(mapId) {
        if (!confirm('Tem certeza que deseja excluir este mapa astral?')) return;
        
        try {
            const response = await fetch(`/api/admin/maps/${mapId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Mapa excluído com sucesso!');
                this.loadMaps();
                this.loadDashboardData();
            } else {
                alert('Erro ao excluir mapa: ' + data.error);
            }
        } catch (error) {
            console.error('Erro ao excluir mapa:', error);
            alert('Erro ao excluir mapa');
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    loadAnalytics() {
        // Simulate loading analytics data
        console.log('Loading cosmic analytics...');
        
        // Animate the numbers
        this.animateCosmicNumbers();
    }

    loadEvents() {
        // Simulate loading planetary events
        console.log('Loading planetary events...');
    }

    animateCosmicNumbers() {
        const elements = [
            { id: 'lunar-influence', target: 78 },
            { id: 'solar-activity', target: 92 },
            { id: 'planetary-alignment', target: 65 },
            { id: 'cosmic-energy', target: 84 }
        ];

        elements.forEach(({ id, target }) => {
            const element = document.getElementById(id);
            if (element) {
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    element.textContent = Math.round(current) + '%';
                }, 30);
            }
        });
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    async loadRoles() {
        this.showLoading();
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            
            if (data.success) {
                this.renderRolesTable(data.users);
            }
        } catch (error) {
            console.error('Erro ao carregar usuários para roles:', error);
        } finally {
            this.hideLoading();
        }
    }

    renderRolesTable(users) {
        const tbody = document.getElementById('roles-tbody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            const roleClass = this.getRoleClass(user.role || 'user');
            const roleName = this.getRoleName(user.role || 'user');
            
            row.innerHTML = `
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td><span class="status-badge ${roleClass}">${roleName}</span></td>
                <td>
                    <select onchange="adminPanel.updateUserRole('${user._id}', this.value)" class="role-select">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="tarologo" ${user.role === 'tarologo' ? 'selected' : ''}>Tarólogo</option>
                        <option value="astrologo" ${user.role === 'astrologo' ? 'selected' : ''}>Astrólogo</option>
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getRoleClass(role) {
        const classes = {
            'user': 'status-inactive',
            'tarologo': 'status-warning', 
            'astrologo': 'status-active'
        };
        return classes[role] || 'status-inactive';
    }

    getRoleName(role) {
        const names = {
            'user': 'Usuário',
            'tarologo': 'Tarólogo',
            'astrologo': 'Astrólogo'
        };
        return names[role] || 'Usuário';
    }

    async updateUserRole(userId, newRole) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Role atualizado com sucesso!');
                this.loadRoles();
            } else {
                alert('Erro ao atualizar role: ' + data.error);
            }
        } catch (error) {
            console.error('Erro ao atualizar role:', error);
            alert('Erro ao atualizar role');
        }
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

// Add cosmic particles effect
function createCosmicParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'cosmic-particles';
    document.body.appendChild(particlesContainer);
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 6000);
    }
    
    // Create particles periodically
    setInterval(createParticle, 300);
}

// Initialize cosmic effects
document.addEventListener('DOMContentLoaded', () => {
    createCosmicParticles();
    
    // Add cosmic glow to important elements
    setTimeout(() => {
        document.querySelectorAll('.stat-card, .chart-card').forEach(el => {
            el.classList.add('cosmic-pulse');
        });
    }, 1000);
});

// Initialize admin panel
const adminPanel = new AdminPanel();
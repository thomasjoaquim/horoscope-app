// public/auth.js - Funções de autenticação

// Verificar se o usuário está logado
async function verificarAutenticacao() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success) {
            return data.user;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Fazer logout
async function fazerLogout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// Proteger página (só usuários logados podem acessar)
async function protegerPagina() {
    const user = await verificarAutenticacao();
    
    if (!user) {
        // Redirecionar para login se não estiver logado
        window.location.href = 'login.html';
        return null;
    }
    
    return user;
}
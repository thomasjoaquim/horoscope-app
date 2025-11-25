// Script para tornar um usuário administrador
// Execute: node make-admin.js email@do.usuario

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function makeAdmin() {
    try {
        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        // Pegar email do argumento da linha de comando
        const email = process.argv[2];
        
        if (!email) {
            console.log('❌ Uso: node make-admin.js email@do.usuario');
            process.exit(1);
        }

        // Pegar role do argumento (opcional)
        const role = process.argv[3] || 'astrologo';
        
        if (!['user', 'tarologo', 'astrologo'].includes(role)) {
            console.log('❌ Role inválido! Use: user, tarologo ou astrologo');
            process.exit(1);
        }

        // Encontrar e atualizar usuário
        const user = await User.findOneAndUpdate(
            { email: email },
            { 
                isAdmin: true,
                role: role
            },
            { new: true }
        );

        if (user) {
            console.log(`✅ Usuário ${user.nome} (${user.email}) agora é administrador com role: ${role}!`);
        } else {
            console.log(`❌ Usuário com email ${email} não encontrado.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

makeAdmin();
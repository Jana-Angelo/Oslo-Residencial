const fs = require('fs');
const path = require('path');

const loginFile = path.resolve('src/components/LoginScreen.tsx');
let loginCode = fs.readFileSync(loginFile, 'utf-8');

// 1. Imports
loginCode = loginCode.replace(
  'import { APARTMENT_OPTIONS } from \'../data\';',
  'import { APARTMENT_OPTIONS } from \'../data\';\nimport { supabase } from \'../lib/supabaseClient\';'
);

// 2. Interface
loginCode = loginCode.replace(
  'onLogin: (apartment: string) => void;',
  'onLogin: () => void;'
);

// 3. States
loginCode = loginCode.replace(
  'const [apartment, setApartment] = useState(\'\');',
  'const [email, setEmail] = useState(\'\');'
);

loginCode = loginCode.replace(
  /  \/\/ Loaded registered users from localStorage[\s\S]*?  \/\/ Forgot Password State/g,
  '  // Forgot Password State'
);

loginCode = loginCode.replace(
  'const [forgotApartment, setForgotApartment] = useState(\'\');\n',
  ''
);

loginCode = loginCode.replace(
  'const [regApartment, setRegApartment] = useState(\'\');',
  'const [regNomeCompleto, setRegNomeCompleto] = useState(\'\');\n  const [regEmail, setRegEmail] = useState(\'\');\n  const [regApartment, setRegApartment] = useState(\'\');'
);

// 4. Handlers
const handlersTarget = /const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?\}, 1200\);\n  \};/g;

const newHandlers = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe o seu e-mail.');
      return;
    }
    if (!password) {
      setError('Por favor, digite sua senha.');
      return;
    }

    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : authError.message);
      return;
    }

    onLogin();
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotEmail) {
      setForgotError('Por favor, informe o seu e-mail cadastrado.');
      return;
    }
    if (!/^[^\\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Por favor, insira um e-mail válido.');
      return;
    }

    setForgotLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail);
    setForgotLoading(false);

    if (resetError) {
      setForgotError(resetError.message);
    } else {
      setForgotSuccess(true);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regNomeCompleto || !regEmail || !regApartment || !regPassword) {
      setRegError('Por favor, preencha todos os campos.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Sua senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas digitadas não são iguais.');
      return;
    }

    setRegLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });

    if (authError) {
      setRegError(authError.message);
      setRegLoading(false);
      return;
    }

    const user = authData.user;
    if (user) {
      // Create Perfil
      await supabase.from('perfis').insert({
        id: user.id,
        nome_completo: regNomeCompleto,
        tipo_perfil: 'morador'
      });

      // Handle Unidade creation
      const numeroApto = regApartment.replace('Apartamento ', '');
      let unidadeId;

      const { data: existingUnidade } = await supabase
        .from('unidades')
        .select('id')
        .eq('bloco', 'Único')
        .eq('numero', numeroApto)
        .maybeSingle();

      if (existingUnidade) {
        unidadeId = existingUnidade.id;
      } else {
        const { data: novaUnidade } = await supabase
          .from('unidades')
          .insert({ bloco: 'Único', numero: numeroApto })
          .select()
          .single();
        if (novaUnidade) unidadeId = novaUnidade.id;
      }

      if (unidadeId) {
        await supabase.from('moradores').insert({
          unidade_id: unidadeId,
          perfil_id: user.id,
          nome_completo: regNomeCompleto,
          tipo: 'Proprietário'
        });
      }
    }

    setRegLoading(false);
    setRegSuccess(true);
  };`;

loginCode = loginCode.replace(handlersTarget, newHandlers);

// 5. Login JSX
loginCode = loginCode.replace(
  'Apartamento\n            </label>\n            <div className="relative">\n              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">\n                <Building2 className="w-5 h-5" />\n              </span>\n              <input\n                type="text"\n                placeholder="Ex: 102 Bloco B"\n                value={apartment}\n                onChange={(e) => {\n                  setApartment(e.target.value);\n                  setError(\'\');\n                }}\n                className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"\n              />',
  'E-mail\n            </label>\n            <div className="relative">\n              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">\n                <Mail className="w-5 h-5" />\n              </span>\n              <input\n                type="email"\n                placeholder="seuemail@exemplo.com"\n                value={email}\n                onChange={(e) => {\n                  setEmail(e.target.value);\n                  setError(\'\');\n                }}\n                className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"\n              />'
);

// 6. Reset password form clearing
loginCode = loginCode.replace('setForgotApartment(\'\');\n', '');

// 7. Register form clearing
loginCode = loginCode.replace(
  'setRegApartment(\'\');',
  'setRegNomeCompleto(\'\');\n              setRegEmail(\'\');\n              setRegApartment(\'\');'
);

// 8. Forgot Password JSX remove apartment
const forgotAptRegex = /<div className="space-y-1\.5">[\s\S]*?<label className="text-\[#8C7364\] text-\[10px\] font-bold tracking-widest uppercase block">\n\s*Seu Apartamento[\s\S]*?<\/AnimatePresence>\n\s*<\/div>\n\s*<\/div>\n/;
loginCode = loginCode.replace(forgotAptRegex, '');

// 9. Forgot password success message
loginCode = loginCode.replace(
  'Um link de redefinição de senha foi enviado para o e-mail <strong className="text-[#3E342F]">{forgotEmail}</strong> cadastrado para o <strong className="text-[#3E342F]">{forgotApartment}</strong>',
  'Um link de redefinição de senha foi enviado para o e-mail <strong className="text-[#3E342F]">{forgotEmail}</strong>'
);

// 10. Register JSX add Nome and Email before Apartment
const regAptJSXTarget = '<div className="space-y-1.5">\n                      <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">\n                        Seu Apartamento';

const regAptJSXReplacement = `<div className="space-y-1.5">
                      <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                          <User className="w-5 h-5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Seu nome completo"
                          value={regNomeCompleto}
                          onChange={(e) => setRegNomeCompleto(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                        Seu E-mail
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                          <Mail className="w-5 h-5" />
                        </span>
                        <input
                          type="email"
                          placeholder="seuemail@exemplo.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                        Seu Apartamento`;

loginCode = loginCode.replace(regAptJSXTarget, regAptJSXReplacement);

// 11. Register Success button handler
loginCode = loginCode.replace(
  'setApartment(regApartment);',
  'setEmail(regEmail);'
);

fs.writeFileSync(loginFile, loginCode);

// APP.TSX REFACTOR
const appFile = path.resolve('src/App.tsx');
let appCode = fs.readFileSync(appFile, 'utf-8');

appCode = appCode.replace(
  'import { INITIAL_PROFILE \n} from \'./data\';',
  'import { INITIAL_PROFILE \n} from \'./data\';\nimport { supabase } from \'./lib/supabaseClient\';'
);

appCode = appCode.replace(
  'import { \n  INITIAL_NOTICES, \n  INITIAL_RECOMMENDATIONS, \n  INITIAL_PAYMENTS, \n  INITIAL_FINANCIAL_SUMMARY, \n  INITIAL_PROFILE \n} from \'./data\';',
  'import { \n  INITIAL_NOTICES, \n  INITIAL_RECOMMENDATIONS, \n  INITIAL_PAYMENTS, \n  INITIAL_FINANCIAL_SUMMARY, \n  INITIAL_PROFILE \n} from \'./data\';\nimport { supabase } from \'./lib/supabaseClient\';'
);

const authEffect = `
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
        setCurrentScreen('dashboard');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: perfilData } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data: moradorData } = await supabase
        .from('moradores')
        .select('*, unidades(*)')
        .eq('perfil_id', userId)
        .single();

      if (perfilData) {
        const isAdmin = perfilData.tipo_perfil === 'admin' || perfilData.tipo_perfil === 'sindico';
        const aptNumber = moradorData?.unidades ? \`Apartamento \${moradorData.unidades.numero}\` : 'Desconhecido';
        
        const profile = {
          fullName: perfilData.nome_completo || 'Sem Nome',
          apartmentNumber: aptNumber,
          role: isAdmin ? 'Administrador' : 'Morador',
          avatar: perfilData.avatar_url || '',
          twoFactorEnabled: false,
          visibleToOthers: true,
          isAdmin: isAdmin
        };
        setUserProfile(profile);
      }
    } catch (e) {
      console.error('Error fetching profile', e);
    }
  };
`;

appCode = appCode.replace(
  '  const isAdminUser = userProfile.isAdmin !== false && (userProfile.role === \'Administrador\' || userProfile.role === \'Síndico\' || userProfile.isAdmin === true);',
  authEffect + '\n\n  const isAdminUser = userProfile.isAdmin !== false && (userProfile.role === \'Administrador\' || userProfile.role === \'Síndico\' || userProfile.isAdmin === true);'
);

const oldLoginHandlerTarget = /<LoginScreen \n[\s\S]*? \/>/;

const newLoginHandler = `<LoginScreen 
              onLogin={() => {
                handleNavigate('dashboard', 'push');
              }} 
            />`;

appCode = appCode.replace(oldLoginHandlerTarget, newLoginHandler);

fs.writeFileSync(appFile, appCode);
console.log('Files updated successfully!');

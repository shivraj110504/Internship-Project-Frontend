import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import OtpVerificationModal from './OtpVerificationModal';
import { toast } from 'react-toastify';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'pt', name: 'Português' },
    { code: 'zh', name: '中文' },
    { code: 'fr', name: 'Français' },
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [pendingLang, setPendingLang] = useState('');

    const handleLanguageChange = (langCode: string) => {
        if (langCode === i18n.language) return;

        if (!user) {
            toast.warning("Please log in to switch language as it requires OTP verification.");
            return;
        }

        setPendingLang(langCode);
        setShowModal(true);
    };

    const confirmLanguageChange = () => {
        i18n.changeLanguage(pendingLang);
        setShowModal(false);
    };

    const getLanguageName = (code: string) => {
        return languages.find(l => l.code === code)?.name || code;
    };

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition text-sm font-medium text-gray-700">
                <Globe className="w-4 h-4 text-orange-600" />
                <span className="hidden md:inline">{getLanguageName(i18n.language)}</span>
                <span className="md:hidden uppercase">{i18n.language}</span>
            </button>

            {/* Basic Dropdown */}
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition ${i18n.language === lang.code ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-700'
                            }`}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>

            {showModal && user && (
                <OtpVerificationModal
                    userId={user._id}
                    language={pendingLang}
                    onVerify={confirmLanguageChange}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default LanguageSwitcher;

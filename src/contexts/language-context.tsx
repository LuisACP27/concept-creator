"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations object
const translations = {
  en: {
    // Main page
    'app.title': 'Concept Creator',
    'app.subtitle': 'Bring your album concepts to life.',
    'app.noAlbums': 'No albums yet',
    'app.noAlbumsDescription': 'Click the \'+\' to create your first album concept.',
    
    // Album form
    'form.coverArt': 'Cover Art',
    'form.albumName': 'Album Name',
    'form.styleDescription': 'Style Description',
    'form.concept': 'Concept',
    'form.targetAudience': 'Target Audience',
    'form.lyricalContent': 'Lyrical Content',
    'form.productionSound': 'Production & Sound',
    'form.tracklist': 'Tracklist',
    'form.songTitle': 'Song Title',
    'form.description': 'Description',
    'form.addSong': 'Add Song',
    'form.remove': 'Remove',
    'form.deleteAlbum': 'Delete Album',
    'form.createAlbum': 'Create Album',
    'form.updateAlbum': 'Update Album',
    'form.saving': 'Saving...',
    
    // Placeholders
    'placeholder.albumName': 'Ex: Echoes of the Void',
    'placeholder.styleDescription': 'Ex: A blend of synth-pop and ambient soundscapes...',
    'placeholder.concept': 'Ex: A journey through a dystopian city...',
    'placeholder.targetAudience': 'Ex: Fans of 80s sci-fi movies and electronic music...',
    'placeholder.lyricalContent': 'Ex: Themes of rebellion, love and loss in a futuristic world...',
    'placeholder.productionSound': 'Ex: Gated reverb drums, analog synthesizers and lush pads...',
    'placeholder.songTitle': 'Ex: Echoes in the Night',
    'placeholder.songDescription': 'Song description, theme, style...',
    'placeholder.uploadImage': 'Click or drag to upload',
    
    // Messages
    'message.albumNameRequired': 'Album name is required.',
    'message.coverImageRequired': 'Cover image is required.',
    'message.allSongsNeedTitle': 'All songs must have a title.',
    'message.albumUpdated': 'Your album concept has been updated.',
    'message.albumCreated': 'Your album concept has been created.',
    'message.errorSaving': 'Error saving album. Please try again.',
    'message.success': 'Success!',
    'message.error': 'Error',
    'message.noSongsAdded': 'No songs added yet.',
    'message.noSongsDescription': 'Click "Add Song" to get started.',
    
    // Navigation
    'nav.back': 'Back',
    'nav.edit': 'Edit',
    'nav.backToHome': 'Back to home',
    'nav.goBackHome': 'Go back home',
    
    // Page titles
    'page.createAlbum': 'Create Album Concept',
    'page.editAlbum': 'Edit Album Concept',
    'page.albumNotFound': 'Album not found',
    'page.albumNotFoundDescription': 'The album you\'re looking for doesn\'t exist.',
    'page.albumNotFoundEdit': 'The album you are trying to edit does not exist.',
    
    // View page
    'view.styleDescription': 'Style Description',
    'view.concept': 'Concept',
    'view.targetAudience': 'Target Audience',
    'view.lyricalContent': 'Lyrical Content',
    'view.productionSound': 'Production & Sound',
    'view.tracklist': 'Tracklist',
    
    // Language switcher
    'language.english': 'English',
    'language.spanish': 'Español',
  },
  es: {
    // Main page
    'app.title': 'Concept Creator',
    'app.subtitle': 'Da vida a tus conceptos de álbumes.',
    'app.noAlbums': 'Aún no hay álbumes',
    'app.noAlbumsDescription': 'Haz clic en el \'+\' para crear tu primer concepto de álbum.',
    
    // Album form
    'form.coverArt': 'Arte de Portada',
    'form.albumName': 'Nombre del Álbum',
    'form.styleDescription': 'Descripción de Estilo',
    'form.concept': 'Concepto',
    'form.targetAudience': 'Público Objetivo',
    'form.lyricalContent': 'Contenido Lírico',
    'form.productionSound': 'Producción y Sonido',
    'form.tracklist': 'Lista de Canciones',
    'form.songTitle': 'Título de la Canción',
    'form.description': 'Descripción',
    'form.addSong': 'Añadir Canción',
    'form.remove': 'Eliminar',
    'form.deleteAlbum': 'Eliminar Álbum',
    'form.createAlbum': 'Crear Álbum',
    'form.updateAlbum': 'Actualizar Álbum',
    'form.saving': 'Guardando...',
    
    // Placeholders
    'placeholder.albumName': 'Ej: Ecos del Vacío',
    'placeholder.styleDescription': 'Ej: Una mezcla de synth-pop y paisajes sonoros ambientales...',
    'placeholder.concept': 'Ej: Un viaje a través de una ciudad distópica...',
    'placeholder.targetAudience': 'Ej: Fans de películas de ciencia ficción de los 80 y música electrónica...',
    'placeholder.lyricalContent': 'Ej: Temas de rebelión, amor y pérdida en un mundo futurista...',
    'placeholder.productionSound': 'Ej: Baterías con reverb gated, sintetizadores análogos y pads exuberantes...',
    'placeholder.songTitle': 'Ej: Ecos en la Noche',
    'placeholder.songDescription': 'Descripción de la canción, temática, estilo...',
    'placeholder.uploadImage': 'Haz clic o arrastra para subir',
    
    // Messages
    'message.albumNameRequired': 'El nombre del álbum es requerido.',
    'message.coverImageRequired': 'Se requiere una imagen de portada.',
    'message.allSongsNeedTitle': 'Todas las canciones deben tener un título.',
    'message.albumUpdated': 'Tu concepto de álbum ha sido actualizado.',
    'message.albumCreated': 'Tu concepto de álbum ha sido creado.',
    'message.errorSaving': 'Error al guardar el álbum. Inténtalo de nuevo.',
    'message.success': '¡Éxito!',
    'message.error': 'Error',
    'message.noSongsAdded': 'No hay canciones añadidas.',
    'message.noSongsDescription': 'Haz clic en "Añadir Canción" para empezar.',
    
    // Navigation
    'nav.back': 'Volver',
    'nav.edit': 'Editar',
    'nav.backToHome': 'Volver al inicio',
    'nav.goBackHome': 'Volver al inicio',
    
    // Page titles
    'page.createAlbum': 'Crear Concepto de Álbum',
    'page.editAlbum': 'Editar Concepto de Álbum',
    'page.albumNotFound': 'Álbum no encontrado',
    'page.albumNotFoundDescription': 'El álbum que buscas no existe.',
    'page.albumNotFoundEdit': 'El álbum que intentas editar no existe.',
    
    // View page
    'view.styleDescription': 'Descripción de Estilo',
    'view.concept': 'Concepto',
    'view.targetAudience': 'Público Objetivo',
    'view.lyricalContent': 'Contenido Lírico',
    'view.productionSound': 'Producción y Sonido',
    'view.tracklist': 'Lista de Canciones',
    
    // Language switcher
    'language.english': 'English',
    'language.spanish': 'Español',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 
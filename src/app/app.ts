import { Component, signal, effect, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Theme state (default to dark mode for modern aesthetics)
  readonly isDarkMode = signal(true);
  
  // Navigation active section
  readonly activeSection = signal('home');
  readonly isMobileMenuOpen = signal(false);
  
  // Certificate Lightbox state
  readonly isCertificateModalOpen = signal(false);
  readonly modalImage = signal('');
  readonly modalTitle = signal('');
  
  // Contact Form state
  readonly contactName = signal('');
  readonly contactEmail = signal('');
  readonly contactMessage = signal('');
  readonly formStatus = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  // Animated titles list
  private readonly titles = ['Full Stack Developer', 'MEAN Stack Intern', 'Angular Developer', 'Problem Solver'];
  readonly currentTitle = signal('Full Stack Developer');
  
  constructor() {
    // SSR-Safe Effect to apply Dark Mode class to <html>
    effect(() => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (this.isDarkMode()) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    });

    // Start title rotation and scroll-spy after render in browser
    afterNextRender(() => {
      this.initTitleRotation();
      this.initScrollSpy();
    });
  }

  // Toggle dark/light theme
  toggleTheme() {
    this.isDarkMode.update(prev => !prev);
  }

  // Toggle mobile navigation menu
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(prev => !prev);
  }

  // Scroll smoothly to a section
  scrollTo(sectionId: string) {
    this.isMobileMenuOpen.set(false);
    if (typeof document !== 'undefined') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Open the lightbox viewer for a certificate
  openCertificate(imagePath: string, title: string) {
    this.modalImage.set(imagePath);
    this.modalTitle.set(title);
    this.isCertificateModalOpen.set(true);
    // Prevent background scrolling
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  // Close the lightbox viewer
  closeCertificate() {
    this.isCertificateModalOpen.set(false);
    // Restore background scrolling
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  // Mock Contact Form Submit
  submitContactForm(event: Event) {
    event.preventDefault();
    if (!this.contactName() || !this.contactEmail() || !this.contactMessage()) {
      this.formStatus.set('error');
      return;
    }

    this.formStatus.set('submitting');
    
    // Simulate API request delay
    setTimeout(() => {
      this.formStatus.set('success');
      // Clear inputs
      this.contactName.set('');
      this.contactEmail.set('');
      this.contactMessage.set('');
      
      // Reset status message after 5 seconds
      setTimeout(() => {
        if (this.formStatus() === 'success') {
          this.formStatus.set('idle');
        }
      }, 5000);
    }, 1200);
  }

  // Title text typing/rotation logic
  private initTitleRotation() {
    let index = 0;
    setInterval(() => {
      index = (index + 1) % this.titles.length;
      this.currentTitle.set(this.titles[index]);
    }, 3000);
  }

  // Setup active section detection based on window scroll position
  private initScrollSpy() {
    if (typeof window === 'undefined') return;
    
    const sections = ['home', 'about', 'skills', 'experience', 'projects', 'certificates', 'contact'];
    
    const onScroll = () => {
      const scrollPos = window.scrollY + 160; // Offset for navbar height
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            this.activeSection.set(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', onScroll);
    onScroll(); // Trigger initially
  }
}

import { Variants } from "framer-motion";

// Page Transitions
export const pageVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 10
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0.0, 0.2, 1],
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1]
    }
  }
};

// Container variants for staggered children animations
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

// Item variants for appearing/disappearing with fade+scale
export const itemVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 15,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2
    }
  }
};

// Card hover animations
export const cardHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.03, 
    y: -5,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    }
  },
  tap: { 
    scale: 0.98, 
    transition: { duration: 0.1 } 
  }
};

// Logo animation
export const logoVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Sidebar item animations
export const sidebarItemVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: -15 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: { 
    opacity: 0, 
    x: -15,
    transition: {
      duration: 0.2
    } 
  },
  hover: {
    x: 5,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  }
};

// For modals and popups
export const modalVariants: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.75,
    y: 20
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.75,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

// For list items (like in search results)
export const listItemVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: -20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: {
      duration: 0.2
    }
  }
};

// For buttons
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// For RTL variants - mirror the x-axis animations
export const rtlPageVariants: Variants = {
  ...pageVariants,
  initial: { ...pageVariants.initial, x: 10 },
  animate: { ...pageVariants.animate, x: 0 },
  exit: { ...pageVariants.exit, x: -10 }
};

export const rtlListItemVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: {
      duration: 0.2
    }
  }
};

export const rtlSidebarItemVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: 15 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: { 
    opacity: 0, 
    x: 15,
    transition: {
      duration: 0.2
    } 
  },
  hover: {
    x: -5,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  }
};

// Animation for the video progress bar
export const progressBarVariants: Variants = {
  initial: { width: "0%" },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: { 
      duration: 0.1,
      ease: "linear"
    }
  })
};

// For carousel effects
export const carouselItemVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  })
};

// Fade-in animation for images after loading
export const imageLoadVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// For notification/toast animations
export const toastVariants: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.3 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.5, 
    y: 30,
    transition: { 
      duration: 0.2
    } 
  }
};

// For scroll animations
export const scrollAnimationVariants: Variants = {
  offscreen: {
    y: 50,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};
// A simple i18n module for Arabic with English support
const translations = {
  ar: {
    // Navbar
    home: "الرئيسية",
    movies: "الأفلام",
    series: "المسلسلات",
    voting: "التصويت",
    liveStream: "البث المباشر",
    admin: "لوحة التحكم",
    greeting: "مرحباً،",
    search: "بحث...",
    adminAccess: "دخول المسؤول",
    enterAdminPassword: "أدخل كلمة مرور المسؤول",
    invalidPassword: "كلمة المرور غير صحيحة",
    categories: "إدارة التصنيفات",

    // Categories
    all: "الكل",
    action: "أكشن",
    drama: "دراما",
    comedy: "كوميديا",
    adventure: "مغامرة",
    sciFi: "خيال علمي",
    romance: "رومانسي",
    thriller: "إثارة",
    horror: "رعب",

    // Content types
    movie: "فيلم",
    tvSeries: "مسلسل",
    season: "موسم",
    episode: "حلقة",

    // Media actions
    watchNow: "شاهد الآن",
    download: "تحميل",
    latestMovies: "أحدث الأفلام",
    latestEpisode: "الحلقة الجديدة متوفرة الآن",

    // Voting
    contentVoting: "تصويت المحتوى",
    suggestNew: "اقترح محتوى جديد",
    contentTitle: "عنوان المحتوى",
    titlePlaceholder: "اكتب العنوان هنا...",
    type: "النوع",
    category: "التصنيف",
    submit: "إرسال الاقتراح",
    remainingSuggestions: "لديك {count} اقتراحات متبقية اليوم",
    suggestedToday: "المحتوى المقترح اليوم",
    suggestedBy: "اقترحه",
    voteSortingTime: "سيتم فرز الاقتراحات اليوم في الساعة 00:00",
    topSuggestionReview: "أعلى اقتراح سيتم مراجعته من قبل إدارة الاستراحة",

    // Live streaming
    liveNow: "بث مباشر",
    upcoming: "قادم",
    starting: "سيبدأ بعد",
    minutes: "دقيقة",

    // Admin
    dashboard: "لوحة التحكم",
    content: "المحتوى",
    users: "المستخدمين",
    settings: "الإعدادات",
    overview: "نظرة عامة",
    totalContent: "إجمالي المحتوى",
    activeUsers: "المستخدمين النشطين",
    todaySuggestions: "اقتراحات اليوم",
    upcomingBroadcast: "بث مباشر قادم",
    latestContent: "آخر المحتويات المضافة",
    viewAll: "عرض الكل",
    topVoted: "أعلى الاقتراحات تصويتاً",
    reviewStatus: "قيد المراجعة",
    accept: "قبول",
    reject: "رفض",
    otherSuggestions: "اقتراحات أخرى",
    broadcastManagement: "إدارة البث المباشر",
    addNewBroadcast: "إضافة بث جديد",
    adminDashboard: "لوحة التحكم الرئيسية",
    contentManagement: "إدارة المحتوى",
    advertisements: "الإعلانات والعروض",
    liveStreams: "إدارة البث المباشر",
    votingManagement: "إدارة التصويت",
    userManagement: "إدارة المستخدمين",
    systemSettings: "إعدادات النظام",
    title: "العنوان",
    date: "التاريخ",
    time: "الوقت",
    status: "الحالة",
    actions: "الإجراءات",
    votes: "صوت",
    addNew: "إضافة جديد",
    id: "المعرف",
    name: "الاسم",
    createCategory: "إنشاء تصنيف جديد",
    editCategory: "تعديل التصنيف",
    createCategoryDescription: "أدخل معلومات التصنيف الجديد",
    editCategoryDescription: "تعديل معلومات التصنيف",
    manageCategories: "إدارة التصنيفات",
    selectType: "اختر النوع",
    general: "عام",
    update: "تحديث",
    create: "إنشاء",
    noCategories: "لا يوجد تصنيفات متاحة",

    // Login
    loginTitle: "تسجيل الدخول",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    login: "دخول",
    loginFailure: "فشل تسجيل الدخول",
    invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة",

    // Generic
    errorOccurred: "حدث خطأ",
    loading: "جاري التحميل...",
    notFound: "لم يتم العثور على الصفحة",
    backToHome: "العودة للرئيسية",
    addedAgo: "أضيف منذ",
    logout: "تسجيل الخروج",

    // Data States
    loadingContent: "جاري تحميل المحتوى...",
    errorLoadingContent: "حدث خطأ أثناء تحميل المحتوى",
    noContentAvailable: "لا يوجد محتوى متاح",
    loadingFeaturedContent: "جاري تحميل المحتوى المميز...",
    errorLoadingFeaturedContent: "حدث خطأ أثناء تحميل المحتوى المميز",
    noFeaturedContentAvailable: "لا يوجد محتوى مميز متاح",
    featuredContent: "المحتوى المميز",
  },
};

// Default language
let currentLanguage = "ar";

// Simple i18n implementation
const i18n = {
  init() {
    // Set direction for RTL language
    if (currentLanguage === "ar") {
      document.documentElement.setAttribute("dir", "rtl");
    }
  },
  t(key: string, params?: Record<string, string | number>) {
    const lang = currentLanguage;
    let text =
      translations[lang as keyof typeof translations]?.[
        key as keyof (typeof translations)["ar"]
      ] || key;

    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }

    return text;
  },
  setLanguage(lang: string) {
    if (translations[lang as keyof typeof translations]) {
      currentLanguage = lang;

      // Update direction
      document.documentElement.setAttribute(
        "dir",
        lang === "ar" ? "rtl" : "ltr",
      );
    }
  },
  getLanguage() {
    return currentLanguage;
  },
};

export default i18n;

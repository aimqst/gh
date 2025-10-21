import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, CheckCircle, Circle, Filter, Tag } from 'lucide-react';
// قم باستيراد مكتبة framer-motion لإضافة حركات جميلة
import { motion } from 'framer-motion';

// تعريف فئات المهام مع أسماء عربية وألوان تيلويند
const CATEGORIES = [
  { id: 'work', name: 'عمل', color: 'bg-blue-500' },
  { id: 'study', name: 'دراسة', color: 'bg-green-500' },
  { id: 'personal', name: 'شخصي', color: 'bg-purple-500' },
  { id: 'shopping', name: 'تسوق', color: 'bg-yellow-500' },
  { id: 'health', name: 'صحة', color: 'bg-red-500' },
];

// تعريف خيارات الفلترة
const FILTERS = [
  { id: 'all', name: 'الكل' },
  { id: 'active', name: 'غير المكتمل' },
  { id: 'completed', name: 'المكتمل' },
];

// دوال مساعدة للتعامل مع localStorage بأمان
const loadTasks = () => {
  try {
    const saved = localStorage.getItem('smart-tasks-v2');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('فشل تحميل المهام من localStorage:', error);
    return [];
  }
};

const saveTasks = (tasks) => {
  try {
    localStorage.setItem('smart-tasks-v2', JSON.stringify(tasks));
    console.log('تم حفظ المهام بنجاح');
  } catch (error) {
    console.warn('فشل حفظ المهام في localStorage:', error);
    // يمكنك إضافة تنبيه للمستخدم هنا
    alert('⚠️ لا يمكن حفظ المهام. جرب استخدام متصفح مختلف أو تعطيل وضع التصفح الخاص.');
  }
};

export default function App() {
  // حالة جميع المهام
  const [tasks, setTasks] = useState([]);
  // حالة النص للمهمة الجديدة
  const [newTask, setNewTask] = useState('');
  // حالة الفئة المحددة للمهمة الجديدة
  const [selectedCategory, setSelectedCategory] = useState('work');
  // حالة الفلتر الحالي للمهام (الكل، نشط، مكتمل)
  const [filter, setFilter] = useState('all');
  // حالة لتتبع المهمة التي يتم تعديلها حاليًا
  const [editingTaskId, setEditingTaskId] = useState(null);
  // حالة للنص الجديد أثناء التعديل
  const [editingText, setEditingText] = useState('');

  // تأثير جانبي لتحميل المهام من localStorage عند تحميل المكون
  useEffect(() => {
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);
    console.log('تم تحميل المهام:', loadedTasks);
  }, []); // [] يعني أن التأثير يعمل مرة واحدة فقط عند التركيب

  // تأثير جانبي لحفظ المهام في localStorage كلما تغيرت قائمة المهام
  useEffect(() => {
    // نتأكد من أن tasks.length > 0 لتجنب حفظ قائمة فارغة عند الإقلاع لأول مرة
    // أو إذا كان هناك خطأ في التحميل الأولي
    if (tasks.length > 0 || localStorage.getItem('smart-tasks-v2') !== null) {
        saveTasks(tasks);
    }
  }, [tasks]); // [tasks] يعني أن التأثير يعمل كلما تغيرت الحالة tasks

  // دالة لإضافة مهمة جديدة
  const addTask = () => {
    // التحقق من أن النص ليس فارغًا
    if (!newTask.trim()) return;

    // إنشاء كائن المهمة الجديدة
    const task = {
      id: Date.now(), // معرف فريد للمهمة
      text: newTask.trim(),
      category: selectedCategory,
      completed: false, // المهمة تبدأ غير مكتملة
    };

    // إضافة المهمة إلى قائمة المهام الحالية
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    setNewTask(''); // مسح حقل الإدخال
    setSelectedCategory('work'); // إعادة تعيين الفئة الافتراضية
  };

  // دالة لتبديل حالة الإكمال للمهمة
  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  // دالة لحذف مهمة
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    // إذا كانت المهمة المحذوفة هي نفسها التي يتم تعديلها، نوقف وضع التعديل
    if (editingTaskId === id) {
      setEditingTaskId(null);
      setEditingText('');
    }
  };

  // دالة لبدء وضع التعديل لمهمة معينة
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  // دالة لحفظ التعديلات على المهمة
  const saveEdit = () => {
    // التحقق من أن نص التعديل ليس فارغًا
    if (!editingText.trim()) return;

    const updatedTasks = tasks.map(task =>
      task.id === editingTaskId
        ? { ...task, text: editingText.trim() }
        : task
    );
    setTasks(updatedTasks);
    setEditingTaskId(null); // إنهاء وضع التعديل
    setEditingText(''); // مسح نص التعديل
  };

  // حساب عدد المهام النشطة (غير المكتملة)
  const activeTasksCount = tasks.filter(task => !task.completed).length;

  // فلترة المهام بناءً على الفلتر الحالي
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // إذا كان الفلتر 'all'
  });

  // تحديد متغيرات الـ animation (framer-motion)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // تأخير بسيط بين ظهور العناصر
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    // حاوية رئيسية للصفحة مع خلفية متدرجة وتصميم متجاوب
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans text-right" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* عنوان التطبيق ووصفه */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Smart To-Do App</h1>
          <p className="text-gray-600">إدارة ذكية لمهامك اليومية</p>
        </motion.div>

        {/* لوحة إحصائيات المهام النشطة */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-gray-700">
                المهام النشطة: <span className="text-blue-600">{activeTasksCount}</span>
              </span>
            </div>
            {/* أيقونة الفلترة للنوايا الحسنة، لا يوجد فلترة مباشرة هنا */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 rtl:space-x-reverse">
              {/* <Filter className="w-4 h-4" /> */}
              {/* <span>فلترة</span> */}
            </div>
          </div>
        </motion.div>

        {/* لوحة إضافة مهمة جديدة */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
        >
          <div className="space-y-4">
            <div>
              {/* حقل إدخال المهمة الجديدة */}
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="أضف مهمة جديدة..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>
            {/* أزرار اختيار الفئة */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  // تطبيق تصميم مختلف للفئة المختارة
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? `${category.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
            {/* زر إضافة المهمة */}
            <motion.button
              onClick={addTask}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <Plus className="w-5 h-5" />
                <span>إضافة المهمة</span>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* لوحة أزرار الفلترة */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {FILTERS.map(f => (
              <motion.button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === f.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {f.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* قائمة عرض المهام */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredTasks.length === 0 ? (
            // حالة عدم وجود مهام مطابقة للفلتر
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مهام</h3>
              <p className="text-gray-500">
                {filter === 'completed' 
                  ? 'لم تكمل أي مهمة بعد' 
                  : filter === 'active' 
                    ? 'جميع المهام مكتملة!' 
                    : 'ابدأ بإضافة مهمة جديدة'}
              </p>
            </motion.div>
          ) : (
            // عرض المهام المفلترة
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  {/* زر تبديل حالة الإكمال */}
                  <motion.button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500 hover:text-green-600 transition-colors" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </motion.button>
                  
                  <div className="flex-1 min-w-0">
                    {/* عرض حقل التعديل إذا كانت المهمة في وضع التعديل */}
                    {editingTaskId === task.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <motion.button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            حفظ
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setEditingTaskId(null);
                              setEditingText('');
                            }}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            إلغاء
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      // عرض نص المهمة وتفاصيلها بشكل عادي
                      <div>
                        {/* نص المهمة مع تنسيق يتغير عند الإكمال */}
                        <p className={`text-gray-800 break-words ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.text}
                        </p>
                        {/* عرض الفئة وحالة الإكمال */}
                        <div className="flex items-center space-x-2 mt-2 rtl:space-x-reverse">
                          <span className="flex items-center space-x-1 text-xs text-gray-500 rtl:space-x-reverse">
                            <Tag className="w-3 h-3" />
                            <span>
                              {CATEGORIES.find(c => c.id === task.category)?.name || 'غير مصنف'}
                            </span>
                          </span>
                          {task.completed && (
                            <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                              مكتمل
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* أزرار التعديل والحذف (تختفي عند وضع التعديل) */}
                  {editingTaskId !== task.id && (
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <motion.button
                        onClick={() => startEditing(task)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
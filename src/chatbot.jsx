import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, CheckCircle2, Circle, Plus, ArrowLeft, Download, Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';


const API_URL = 'https://resume-chatbot-backend-aq9a.onrender.com'
// API Configuration
const API_BASE_URLS = {
  project: `${API_URL}/api/v1/chatbot/project`,
  experience: `${API_URL}/api/v1/chatbot/experience`,
  education: `${API_URL}/api/v1/chatbot/education`,
  achievements: `${API_URL}/api/v1/chatbot/achievements`,
  skills: `${API_URL}/api/v1/chatbot/skills`,
};

// API Helper
const createApiClient = (baseURL) => {
  return {
    startChat: async (userId, apiKey) => {
      const response = await fetch(`${baseURL}/start_chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ user_id: userId }),
      });
      return response.json();
    },
    sendMessage: async (chatId, message, apiKey) => {
      const response = await fetch(`${baseURL}/chat/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ user_message: message }),
      });
      return response.json();
    },
    getResumeJson: async (chatId, apiKey) => {
      const response = await fetch(`${baseURL}/resume/json/${chatId}`, {
        headers: { 'x-api-key': apiKey },
      });
      return response.json();
    },
  };
};

// Session Storage Helper
const storage = {
  setCredentials: (userId, apiKey) => {
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('apiKey', apiKey);
  },
  getCredentials: () => ({
    userId: sessionStorage.getItem('userId'),
    apiKey: sessionStorage.getItem('apiKey'),
  }),
  setResumeData: (data) => {
    sessionStorage.setItem('resumeData', JSON.stringify(data));
  },
  getResumeData: () => {
    const data = sessionStorage.getItem('resumeData');
    return data ? JSON.parse(data) : null;
  },
  setSectionData: (section, chatId, data) => {
    sessionStorage.setItem(`${section}_chatId`, chatId);
    sessionStorage.setItem(`${section}_data`, JSON.stringify(data));
  },
  getSectionData: (section) => {
    const chatId = sessionStorage.getItem(`${section}_chatId`);
    const data = sessionStorage.getItem(`${section}_data`);
    return { chatId, data: data ? JSON.parse(data) : null };
  },
  clear: () => sessionStorage.clear(),
};

// Main App Component
export default function ResumeBuilderApp() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentSection, setCurrentSection] = useState(null);
  const [resumeData, setResumeData] = useState({
    personal_info: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
    },
    projects: [],
    experience: [],
    education: [],
    achievements: [],
    skills: [],
  });

  useEffect(() => {
    const credentials = storage.getCredentials();
    if (credentials.userId && credentials.apiKey) {
      const savedData = storage.getResumeData();
      if (savedData) setResumeData(savedData);
      setCurrentPage('resume');
    }
  }, []);

  const navigateTo = (page, section = null) => {
    setCurrentPage(page);
    setCurrentSection(section);
  };

  const updateResumeSection = (section, data) => {
    const updated = { ...resumeData };

    if (section === 'project') {
      if (!Array.isArray(updated.projects)) updated.projects = [];
      updated.projects.push(data);
    } else if (['experience', 'education', 'achievements', 'skills'].includes(section)) {
      if (!Array.isArray(updated[section])) updated[section] = [];
      updated[section].push(data);
    } else {
      updated[section] = data;
    }

    setResumeData(updated);
    storage.setResumeData(updated);
  };

  return (
    <div className="app-wrapper">
      {currentPage === 'login' && (
        <LoginPage onLogin={() => navigateTo('resume')} />
      )}
      {currentPage === 'resume' && (
        <ResumePage
          resumeData={resumeData}
          onAddSection={(section) => navigateTo('chat', section)}
        />
      )}
      {currentPage === 'chat' && (
        <ChatPage
          section={currentSection}
          onComplete={(data) => {
            updateResumeSection(currentSection, data);
            navigateTo('resume');
          }}
          onBack={() => navigateTo('resume')}
        />
      )}
    </div>
  );
}

// Login Page Component
function LoginPage({ onLogin }) {
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!userId.trim() || !apiKey.trim()) {
      alert('Please enter both User ID and API Key');
      return;
    }
    setIsLoading(true);
    storage.setCredentials(userId, apiKey);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">📄</div>
        <h1>AI Resume Builder</h1>
        <p>Create your professional resume with AI assistance</p>
        <div className="login-form">
          <input
            type="text"
            className="input-field"
            placeholder="Enter your Full Name"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Enter your GROQ API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={isLoading || !userId.trim() || !apiKey.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Loading...
              </>
            ) : (
              'Get Started'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Resume Page Component
function ResumePage({ resumeData, onAddSection }) {
  const handleDownload = () => {
    window.print();
  };

  const name = sessionStorage.getItem('userId');

  return (
    <div className="resume-container">
      <div className="resume-header">
        <h1>My Resume</h1>
        <button className="btn-secondary" onClick={handleDownload}>
          <Download size={18} />
          Download PDF
        </button>
      </div>

      <div className="resume-paper">
        {/* Header Section */}
        <div className="resume-header-section">
          <h1 className="resume-name">
            {name || 'Your Name'}
          </h1>
          <div className="resume-contact">
            {resumeData.personal_info?.email && (
              <div className="contact-item">
                <Mail size={14} />
                <span>{resumeData.personal_info.email}</span>
              </div>
            )}
            {resumeData.personal_info?.phone && (
              <div className="contact-item">
                <Phone size={14} />
                <span>{resumeData.personal_info.phone}</span>
              </div>
            )}
            {resumeData.personal_info?.location && (
              <div className="contact-item">
                <MapPin size={14} />
                <span>{resumeData.personal_info.location}</span>
              </div>
            )}
            {resumeData.personal_info?.linkedin && (
              <div className="contact-item">
                <Linkedin size={14} />
                <a href={resumeData.personal_info.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </div>
            )}
            {resumeData.personal_info?.github && (
              <div className="contact-item">
                <Github size={14} />
                <a href={resumeData.personal_info.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div className="resume-section">
          <div className="section-header">
            <h2 className="section-title">Experience</h2>
            <button className="btn-add" onClick={() => onAddSection('experience')}>
              <Plus size={16} />
              Add Experience
            </button>
          </div>
          {resumeData.experience?.length > 0 ? (
            resumeData.experience.map((exp, idx) => (
              <div key={idx} className="item-card">
                <div className="item-header">
                  <div>
                    <div className="item-title">{exp.title || exp.role}</div>
                    <div className="item-subtitle">{exp.company}</div>
                  </div>
                  <div className="item-meta">
                    {exp.timeline?.start_date} - {exp.timeline?.end_date || 'Present'}
                  </div>
                </div>
                <div className="item-description">
                  {Array.isArray(exp.description) ? (
                    <ul>
                      {exp.description.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{exp.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-section">No experience added yet</div>
          )}
        </div>

        {/* Projects Section */}
        <div className="resume-section">
          <div className="section-header">
            <h2 className="section-title">Projects</h2>
            <button className="btn-add" onClick={() => onAddSection('project')}>
              <Plus size={16} />
              Add Project
            </button>
          </div>
          {resumeData.projects?.length > 0 ? (
            resumeData.projects.map((proj, idx) => (
              <div key={idx} className="item-card">
                <div className="item-header">
                  <div>
                    <div className="item-title">{proj.title}</div>
                    {proj.role && <div className="item-subtitle">{proj.role}</div>}
                  </div>
                  <div className="item-meta">
                    {proj.timeline?.start_date} - {proj.timeline?.end_date}
                  </div>
                </div>
                <div className="item-description">
                  {Array.isArray(proj.description) ? (
                    <ul>
                      {proj.description.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{proj.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-section">No projects added yet</div>
          )}
        </div>

        {/* Education Section */}
        <div className="resume-section">
          <div className="section-header">
            <h2 className="section-title">Education</h2>
            <button className="btn-add" onClick={() => onAddSection('education')}>
              <Plus size={16} />
              Add Education
            </button>
          </div>
          {resumeData.education?.length > 0 ? (
            resumeData.education.map((edu, idx) => (
              <div key={idx} className="item-card">
                <div className="item-header">
                  <div>
                    <div className="item-title">{edu.degree}</div>
                    <div className="item-subtitle">{edu.institution}</div>
                  </div>
                  <div className="item-meta">
                    {edu.timeline?.start_date} - {edu.timeline?.end_date}
                  </div>
                </div>
                {edu.gpa && (
                  <div className="item-description">
                    <strong>GPA:</strong> {edu.gpa}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-section">No education added yet</div>
          )}
        </div>

        {/* Skills Section */}
        <div className="resume-section">
          <div className="section-header">
            <h2 className="section-title">Skills</h2>
            <button className="btn-add" onClick={() => onAddSection('skills')}>
              <Plus size={16} />
              Add Skills
            </button>
          </div>
          {resumeData.skills?.length > 0 ? (
            <div className="skills-grid">
              {resumeData.skills.map((skillGroup, idx) => (
                <div key={idx} className="skill-category">
                  <div className="skill-category-title">{skillGroup.category}</div>
                  <div className="skill-tags">
                    {skillGroup.items?.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">No skills added yet</div>
          )}
        </div>

        {/* Achievements Section */}
        <div className="resume-section">
          <div className="section-header">
            <h2 className="section-title">Achievements</h2>
            <button className="btn-add" onClick={() => onAddSection('achievements')}>
              <Plus size={16} />
              Add Achievement
            </button>
          </div>
          {resumeData.achievements?.length > 0 ? (
            resumeData.achievements.map((achievement, idx) => (
              <div key={idx} className="item-card">
                <div className="item-title">{achievement.title}</div>
                {achievement.description && (
                  <div className="item-description">{achievement.description}</div>
                )}
                {achievement.date && (
                  <div className="item-meta">{achievement.date}</div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-section">No achievements added yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Chat Page Component
function ChatPage({ section, onComplete, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [progress, setProgress] = useState({ percentage: 0, status: {}, is_complete: false });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const api = createApiClient(API_BASE_URLS[section]);
  const { userId, apiKey } = storage.getCredentials();

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    setIsLoading(true);
    try {
      const response = await api.startChat(userId, apiKey);
      if (response.status) {
        setChatId(response.data.chat_id);
        setMessages([
          {
            role: 'ai',
            content: response.data.ai_response,
            timestamp: new Date().toISOString(),
          },
        ]);
        setProgress({
          percentage: response.data.percentage || 0,
          status: response.data.status || {},
          is_complete: response.data.is_complete || false,
        });
      } else {
        alert('Error starting chat: ' + response.message);
      }
    } catch (error) {
      alert('Failed to start chat: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsLoading(true);

    try {
      const response = await api.sendMessage(chatId, userMessage, apiKey);
      if (response.status) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: response.data.ai_response,
            timestamp: new Date().toISOString(),
          },
        ]);
        setProgress({
          percentage: response.data.percentage || 0,
          status: response.data.status || {},
          is_complete: response.data.is_complete || false,
        });
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const transformSectionData = (section, data) => {
    switch (section) {
      case 'project':
        return data;
      
      case 'skills':
        return {
          category: data.category_name,
          items: data.skills,
        };
      
      case 'achievements':
        return {
          title: data.achievement_title,
          description: Array.isArray(data.description) 
            ? data.description.join(' ') 
            : data.description,
          date: data.timeline,
          type: data.achievement_type,
          organization: data.organization_name,
        };
      
      case 'experience':
        return {
          title: data.title,
          company: data.organization_name,
          type: data.type,
          timeline: data.timeline,
          location: data.location,
          description: data.description,
        };
      
      case 'education':
        return {
          degree: data.degree_or_course,
          institution: data.institution_name,
          field: data.field_of_study,
          timeline: data.timeline,
          gpa: data.grade_or_cgpa,
          location: data.location,
          description: data.description,
        };
      
      default:
        return data;
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await api.getResumeJson(chatId, apiKey);
      if (response.status) {
        const transformedData = transformSectionData(section, response.data);
        storage.setSectionData(section, chatId, transformedData);
        onComplete(transformedData);
      } else {
        alert('Error fetching data: ' + response.message);
      }
    } catch (error) {
      alert('Failed to fetch resume data: ' + error.message);
    }
  };

  const sectionTitles = {
    project: 'Project',
    experience: 'Experience',
    education: 'Education',
    achievements: 'Achievement',
    skills: 'Skills',
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2>Add {sectionTitles[section]}</h2>
      </div>

      <div className="chat-body">
        {/* Left Sidebar - Progress Section */}
        <div className="chat-progress">
          <h3>Progress</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="progress-fields">
            {Object.entries(progress.status).map(([field, completed]) => (
              <div
                key={field}
                className={`field-status ${completed ? 'complete' : ''}`}
              >
                {completed ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Circle size={16} />
                )}
                <span>{field.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Messages */}
        <div className="chat-right-panel">
          <div className="messages-list">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="message-bubble">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-wrapper">
            {/* {!progress.is_complete && ( */}
              <button className="btn-submit" onClick={handleSubmit}>
                Submit
              </button>
            {/* )} */}
            <div className="chat-input-area">
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                disabled={isLoading}
              />
              <button
                className="btn-send"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || progress.is_complete}
              >
                {isLoading ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
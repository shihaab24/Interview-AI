import React, { useState, useRef, useEffect } from 'react'
import "../styles/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const Home = () => {

    const { loading, generateReport,reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const resumeInputRef = useRef()
    const carouselRef = useRef(null)
    const [ showLeftArrow, setShowLeftArrow ] = useState(false)
    const [ showRightArrow, setShowRightArrow ] = useState(false)

    // Form UX states
    const [ toasts, setToasts ] = useState([])
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ resumeUploading, setResumeUploading ] = useState(false)

    const navigate = useNavigate()

    const showToast = (type, message) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, type, message }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }

    const handleJobDescriptionChange = (e) => {
        const val = e.target.value
        if (val.length <= 5000) {
            setJobDescription(val)
        } else {
            setJobDescription(val.substring(0, 5000))
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            showToast("error", "Please upload a PDF file.")
            e.target.value = ""
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast("error", "File is too large. Max size is 5MB.")
            e.target.value = ""
            return
        }

        const isReplacement = !!resumeFile
        setResumeUploading(true)
        
        setTimeout(() => {
            setResumeFile(file)
            setResumeUploading(false)
            showToast(isReplacement ? "info" : "success", isReplacement ? "Resume replaced successfully." : "Resume uploaded successfully.")
        }, 800)
    }

    const handleViewResume = () => {
        if (resumeFile) {
            const url = URL.createObjectURL(resumeFile)
            window.open(url, '_blank')
        }
    }

    const handleReplaceResume = () => {
        if (resumeInputRef.current) {
            resumeInputRef.current.click()
        }
    }

    const handleRemoveResume = () => {
        setResumeFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
        showToast("info", "Resume removed.")
    }

    const updateArrows = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
            setShowLeftArrow(scrollLeft > 2)
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 2)
        }
    }

    useEffect(() => {
        updateArrows()
        window.addEventListener('resize', updateArrows)
        return () => window.removeEventListener('resize', updateArrows)
    }, [ reports ])

    const handleScroll = () => {
        updateArrows()
    }

    const scrollLeft = () => {
        if (carouselRef.current) {
            const { clientWidth } = carouselRef.current
            carouselRef.current.scrollBy({ left: -clientWidth, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (carouselRef.current) {
            const { clientWidth } = carouselRef.current
            carouselRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' })
        }
    }

    const handleGenerateReport = async () => {
        if (loading) return

        const trimmedSelf = selfDescription.trim()
        const trimmedJob = jobDescription.trim()

        if (!resumeFile && !trimmedSelf) {
            showToast("error", "Please upload a resume or provide a self-description before generating your interview strategy.")
            return
        }

        if (!trimmedJob) {
            showToast("error", "Please enter the target job description.")
            return
        }

        try {
            const data = await generateReport({ 
                jobDescription: trimmedJob, 
                selfDescription: trimmedSelf, 
                resumeFile: resumeFile 
            })
            if (data && data._id) {
                showToast("success", "Interview strategy generated successfully.")
                navigate(`/interview/${data._id}`)
            } else {
                showToast("error", "Unable to generate interview strategy.")
            }
        } catch (error) {
            console.error(error)
            showToast("error", "Unable to generate interview strategy.")
        }
    }

    const isInitialLoading = loading && reports.length === 0;

    if (isInitialLoading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={handleJobDescriptionChange}
                            disabled={loading}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className={`char-counter ${jobDescription.length >= 4500 ? 'char-counter--warning' : ''}`} aria-live="polite">
                            {jobDescription.length} / 5000 chars
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <input 
                                ref={resumeInputRef} 
                                onChange={handleFileChange} 
                                hidden 
                                type='file' 
                                id='resume' 
                                name='resume' 
                                accept='.pdf' 
                                disabled={loading || resumeUploading}
                            />
                            {resumeUploading ? (
                                <div className='dropzone dropzone--loading'>
                                    <span className='dropzone__spinner' />
                                    <p className='dropzone__title'>Processing Resume...</p>
                                </div>
                            ) : resumeFile ? (
                                <div className='resume-summary-card' aria-live="polite">
                                    <div className='resume-summary-card__info'>
                                        <div className='resume-summary-card__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        </div>
                                        <div className='resume-summary-card__details'>
                                            <p className='resume-summary-card__name'>{resumeFile.name}</p>
                                            <p className='resume-summary-card__size'>{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                        <div className='resume-summary-card__status'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                        </div>
                                    </div>
                                    <div className='resume-summary-card__actions'>
                                        <button type="button" className='card-action-btn' onClick={handleViewResume} disabled={loading}>View Resume</button>
                                        <button type="button" className='card-action-btn' onClick={handleReplaceResume} disabled={loading}>Replace Resume</button>
                                        <button type="button" className='card-action-btn' onClick={handleRemoveResume} disabled={loading}>Remove Resume</button>
                                    </div>
                                </div>
                            ) : (
                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    </span>
                                    <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                    <p className='dropzone__subtitle'>PDF (Max 5MB)</p>
                                </label>
                            )}
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                disabled={loading}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button
                        onClick={handleGenerateReport}
                        disabled={loading || resumeUploading || (!resumeFile && !selfDescription.trim())}
                        className={`generate-btn ${(loading || resumeUploading || (!resumeFile && !selfDescription.trim())) ? 'generate-btn--disabled' : ''}`}>
                        {loading ? (
                            <span className='generate-btn__spinner' />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        )}
                        {loading ? "Generating Strategy..." : "Generate My Interview Strategy"}
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <div className='carousel-container'>
                        {reports.length > 4 && showLeftArrow && (
                            <button className='carousel-arrow carousel-arrow--left' onClick={scrollLeft} aria-label="Scroll left">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                            </button>
                        )}
                        <ul className='reports-list' ref={carouselRef} onScroll={handleScroll}>
                            {reports.map(report => (
                                <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                    <h3>{report.title || report.jobTitle || 'Untitled Position'}</h3>
                                    <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                    <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                                </li>
                            ))}
                        </ul>
                        {reports.length > 4 && showRightArrow && (
                            <button className='carousel-arrow carousel-arrow--right' onClick={scrollRight} aria-label="Scroll right">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>

            {/* Custom Toast Announcements */}
            <div className="toast-container" aria-live="polite">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast--${t.type}`}>
                        <span className="toast__icon">
                            {t.type === 'success' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            )}
                            {t.type === 'error' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            )}
                            {t.type === 'info' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                            )}
                        </span>
                        <p className="toast__message">{t.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home
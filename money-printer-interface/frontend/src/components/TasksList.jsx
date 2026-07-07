import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  RefreshCw, 
  XCircle, 
  AlertCircle, 
  PlayCircle, 
  Loader2, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  Volume2, 
  Film, 
  Layers, 
  Play,
  Sliders
} from 'lucide-react';

const PIPELINE_STEPS = [
  { key: 'LLM Scripting', label: 'Scripting', desc: 'Writing script' },
  { key: 'Voice Narration', label: 'Voiceover', desc: 'Synthesizing TTS' },
  { key: 'AI Visuals', label: 'AI Art', desc: 'Local SD generation' },
  { key: 'Rendering Video', label: 'Compositing', desc: 'Rendering & subtitles' },
  { key: 'Finalizing', label: 'Finalizing', desc: 'Web optimization' }
];

function ScrollingLogs({ logs, taskId }) {
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const copyToClipboard = () => {
    if (!logs) return;
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: '12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.4)',
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          diagnostics@engine:~/{taskId.slice(0, 8)}
        </span>
        <button
          onClick={copyToClipboard}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem'
          }}
          title="Copy log buffer"
        >
          {copied ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy logs'}
        </button>
      </div>

      <div ref={containerRef} className="terminal-logs">
        {logs && logs.length > 0 ? (
          logs.map((log, index) => {
            let logClass = "system";
            if (log.toLowerCase().includes("completed") || log.toLowerCase().includes("success")) {
              logClass = "success";
            } else if (log.toLowerCase().includes("failed") || log.toLowerCase().includes("error")) {
              logClass = "error";
            } else if (log.toLowerCase().includes("warning")) {
              logClass = "warning";
            }
            
            return (
              <div key={index} className={`log-line ${logClass}`}>
                {log}
              </div>
            );
          })
        ) : (
          <div className="log-line system">[SYSTEM] Establishing log connection stream...</div>
        )}
      </div>
    </div>
  );
}

export default function TasksList({ tasks, onCancelTask, onPlayVideo }) {
  const [expandedTaskLogs, setExpandedTaskLogs] = useState({});

  const toggleLogs = (taskId) => {
    setExpandedTaskLogs(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const activeTasks = Object.values(tasks);

  // Helper to resolve pipeline progress step classes
  const getStepStatus = (task, stepIndex) => {
    const isCompleted = task.status === 'Completed' || task.status === 'completed';
    const isFailed = task.status === 'Failed' || task.status === 'failed';
    
    // Find index of current task step
    const currentStepIndex = PIPELINE_STEPS.findIndex(s => s.key === task.step);
    
    if (isCompleted) return 'completed';
    if (isFailed && stepIndex === currentStepIndex) return 'failed';
    if (isFailed && stepIndex > currentStepIndex) return 'pending';
    if (isFailed && stepIndex < currentStepIndex) return 'completed';
    
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="tab-content fade-in">
      <div className="glass-card">
        <h2 className="section-title" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={20} /> Active Render Tasks ({activeTasks.length})
          </span>
          {activeTasks.some(t => t.status === 'processing') && (
            <Loader2 size={16} className="spin-loader" style={{ color: 'var(--color-primary)' }} />
          )}
        </h2>

        <div className="tasks-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeTasks.length === 0 ? (
            <div className="no-tasks">
              <p>No active tasks in queue.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-muted)' }}>
                Go to the Video Generator tab to compile a new video.
              </p>
            </div>
          ) : (
            activeTasks.map(task => {
              const isExpanded = expandedTaskLogs[task.task_id];
              const isProcessing = task.status === 'processing';
              const isCompleted = task.status === 'Completed' || task.status === 'completed';
              const isFailed = task.status === 'Failed' || task.status === 'failed';
              
              // Formatting aspect ratio
              const formattedAspect = task.aspect_ratio === '9:16' ? '9:16 Portrait' : (task.aspect_ratio === '16:9' ? '16:9 Landscape' : '1:1 Square');
              
              return (
                <div key={task.task_id} className="task-card" style={{ padding: '20px', borderRadius: '14px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                  
                  {/* Header Row */}
                  <div className="task-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div className="task-info-top">
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {task.video_subject ? task.video_subject.split('.')[0] : "AI Video compilation"}
                      </h4>
                      <span className="task-id" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        ID: {task.task_id}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`task-status-badge ${task.status.toLowerCase()}`} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : (isFailed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)'),
                        color: isCompleted ? 'var(--color-success)' : (isFailed ? 'var(--color-danger)' : 'var(--color-primary)')
                      }}>
                        {isProcessing && <Loader2 size={12} className="spin-loader" />}
                        {isCompleted && <CheckCircle2 size={12} />}
                        {isFailed && <AlertCircle size={12} />}
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                    gap: '12px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '12px', 
                    borderRadius: '10px', 
                    marginBottom: '16px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Film size={14} style={{ color: 'var(--color-secondary)' }} />
                      <span>{formattedAspect}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Volume2 size={14} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                        {task.voice_name ? task.voice_name.split('-').slice(2).join('-') || task.voice_name : 'Default Voice'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} style={{ color: 'var(--color-accent)' }} />
                      <span>Duration: {task.duration_seconds ? `${task.duration_seconds.toFixed(0)}s` : 'Auto'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={14} style={{ color: 'var(--color-success)' }} />
                      <span>{task.paragraph_number || 2} Scenes</span>
                    </div>
                  </div>

                  {/* ComfyUI Advanced Parameters Used (If overridden) */}
                  {(task.local_steps || task.local_cfg || task.local_seed) && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: 'rgba(139, 92, 246, 0.04)', 
                      border: '1px dashed rgba(139, 92, 246, 0.2)',
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      marginBottom: '16px',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      flexWrap: 'wrap'
                    }}>
                      <Sliders size={12} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Local Generator Settings:</span>
                      {task.local_steps && <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>Steps: <b>{task.local_steps}</b></span>}
                      {task.local_cfg && <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>CFG: <b>{task.local_cfg}</b></span>}
                      {task.local_seed && <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>Seed: <b>{task.local_seed}</b></span>}
                    </div>
                  )}

                  {/* Stepper Pipeline Timeline */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    margin: '24px 0 20px 0', 
                    position: 'relative', 
                    overflowX: 'auto',
                    paddingBottom: '8px'
                  }}>
                    {/* Stepper Connector Line */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '8%',
                      right: '8%',
                      height: '2px',
                      background: isFailed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.06)',
                      zIndex: 1
                    }} />

                    {PIPELINE_STEPS.map((step, idx) => {
                      const status = getStepStatus(task, idx);
                      let borderCol = 'rgba(255,255,255,0.1)';
                      let bgCol = '#111322';
                      let dotCol = '#444';
                      let textCol = 'var(--text-muted)';
                      let pulseClass = '';

                      if (status === 'completed') {
                        borderCol = 'var(--color-success)';
                        bgCol = 'rgba(16, 185, 129, 0.1)';
                        dotCol = 'var(--color-success)';
                        textCol = 'var(--text-primary)';
                      } else if (status === 'active') {
                        borderCol = 'var(--color-primary)';
                        bgCol = 'rgba(139, 92, 246, 0.15)';
                        dotCol = 'var(--color-primary)';
                        textCol = 'var(--text-primary)';
                        pulseClass = 'pulsing-step';
                      } else if (status === 'failed') {
                        borderCol = 'var(--color-danger)';
                        bgCol = 'rgba(239, 68, 68, 0.15)';
                        dotCol = 'var(--color-danger)';
                        textCol = 'var(--color-danger)';
                      }

                      return (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          flex: 1, 
                          minWidth: '70px',
                          zIndex: 2, 
                          textAlign: 'center' 
                        }}>
                          {/* Circle Dot Indicator */}
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: `2px solid ${borderCol}`,
                            background: bgCol,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            color: textCol,
                            boxShadow: status === 'active' ? '0 0 10px rgba(139, 92, 246, 0.3)' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            {status === 'completed' ? (
                              <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                            ) : (
                              idx + 1
                            )}
                          </div>

                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: status === 'active' || status === 'completed' ? 600 : 500,
                            color: textCol, 
                            marginTop: '8px'
                          }}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Standard Progress Bar */}
                  <div className="progress-section" style={{ marginBottom: '16px' }}>
                    <div className="progress-info" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Step: <b style={{ color: 'var(--text-primary)' }}>{task.step || 'Queueing'}</b></span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          height: '100%',
                          width: `${task.progress}%`,
                          background: isCompleted 
                            ? 'var(--color-success)' 
                            : (isFailed ? 'var(--color-danger)' : 'linear-gradient(to right, var(--color-primary), var(--color-secondary))'),
                          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="task-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="logs-toggle-btn btn btn-outline"
                        onClick={() => toggleLogs(task.task_id)}
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '8px 14px', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Terminal size={14} />
                        {isExpanded ? 'Hide Diagnostics' : 'Show Diagnostics'}
                      </button>

                      {isCompleted && onPlayVideo && task.video_url && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => onPlayVideo({
                            id: task.task_id,
                            title: task.video_subject ? task.video_subject.split('.')[0] : "AI Video",
                            download_url: task.video_url,
                            aspect_ratio: task.aspect_ratio || '9:16'
                          })}
                          style={{
                            fontSize: '0.8rem',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: 'var(--color-success)'
                          }}
                        >
                          <Play size={14} />
                          Preview Video
                        </button>
                      )}
                    </div>

                    {isProcessing && onCancelTask && (
                      <button 
                        className="btn btn-danger btn-icon-only"
                        onClick={() => onCancelTask(task.task_id)}
                        title="Cancel task"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: 'var(--color-danger)',
                          padding: '8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>

                  {/* Collapsed Diagnostic Logs */}
                  {isExpanded && (
                    <ScrollingLogs logs={task.logs} taskId={task.task_id} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useEffect } from 'react';
import { useLogContext } from '../contexts/LogContext.jsx';

// Websocket ready states
// 0: CONNECTING, Socket has been created. The connection is not yet open.
// 1: OPEN, The connection is open and ready to communicate.
// 2: CLOSING, The connection is in the process of closing.
// 3: CLOSED, The connection is closed or couldn't be opened.

export default function useControl() {
	const { log, setLog } = useLogContext();

	const _log = useRef(log);
	const _setLog = (data) => {
		// console.log(data.john);
		// if (data.john) {
		// 	delete data.john;
		// } else {
		// 	return;
		// }
		// console.error('HOOK: Set control');

		// let a = _log.current.nextLog ? _log.current.nextLog.content : undefined;
		// let b = data.nextLog ? data.nextLog.content : undefined;
		// console.error(`HOOK: Changed ${data.john} next log from ${a} to ${b}`);
		// console.error(diff);
		_log.current = data;
		setLog(data);
	};

	const createLog = (content, level = 'info', permanent = false) => {
		console.log(`${level}${permanent ? ' (permanent)' : ''}: ${content}`);
		// console.log(`DEBUGGING (LOG-REQUEST): 1. Log has been requested: ("${content}" ${level}-${permanent ? 'permanent' : 'temporary'})`);

		let iconColors = {
			error: '#EB3941',
			warn: '#D8AF20',
			info: 'white',
		};

		const getAutomaticTimeout = (content) => {
			let timeout = setTimeout(function () {
				// console.log(`DEBUGGING (AUTOMATIC-TIMEOUT): 1. Started retracting log "${content}" automatically after 2s`);
				// console.log(`DEBUGGING (AUTOMATIC-TIMEOUT): - Set log state to inactive`);
				// // console.log(`DEBUGGING: Enabled instant log interception`);
				_setLog({
					..._log.current,
					log: {
						..._log.current.log,
						active: false,
						timeout: undefined,
					},
				});

				setTimeout(function () {
					// console.log(`DEBUGGING (AUTOMATIC-TIMEOUT): 2. Log retracted succesfully`);
					if (_log.current.nextLog) {
						// set the current log to the next log requested
						// console.log(`DEBUGGING (AUTOMATIC-TIMEOUT): - Next log found, keeping instant interception disabled and setting the next log "${_state.current.nextLog.content}"`);
						// console.log(`DEBUGGING (AUTOMATIC-TIMEOUT): - Creating in-depth 2 second timeout for log`);
						_setLog({
							..._log.current,
							log: {
								..._log.current.nextLog,
								active: true,
								// create a timeout of 2 seconds to automatically retract the log
								timeout: _log.current.nextLog.permanent ? undefined : getAutomaticTimeout(_log.current.nextLog.content),
							},
							nextLog: undefined,
						});
					} else {
						// console.log(`DEBUGGING (AUTOMATIC-TIMEOUT): - No previously requested logs found, enabling instant interception`);
						_setLog({
							..._log.current,
							canCreateLog: true,
						});
					}
				}, 200);
			}, 2000);

			// console.log(`DEBUGGING (AUTOMATIC-TIMEOUT): Created automatic timeout with ID: ${timeout}`);
			return timeout;
		};

		// if the current log is permanent, don't create the log
		if (_log.current.log.permanent) return; // console.log(`DEBUGGING (LOG-REQUEST): - Current log is permanent, failed to create request log`);

		// if there is a current log showing, that hasn't retracted
		if (_log.current.log.active) {
			// console.log(`DEBUGGING (LOG-REQUEST): 2. Current log is active`);
			// clear the current log timeout

			clearTimeout(_log.current.log.timeout);
			// console.log(`DEBUGGING (LOG-REQUEST): - Clearing current log timeout (ID: ${_log.current.log.timeout})`);
			// return;
			// set the log state to inactive, causing it to retract in about 0.2 seconds
			// set the next log to this requested log
			_setLog({
				..._log.current,
				log: {
					..._log.current.log,
					active: false,
				},
				nextLog: {
					content: content,
					level: level,
					levelColor: iconColors[level],
					permanent: permanent,
				},
				canCreateLog: false, // disable any instant log creation to prevent interception, since the log is in the process of retracting
				john: 1,
			});

			// console.log(`DEBUGGING (LOG-REQUEST): - Set log state to inactive, retracting in 0.2s`);
			// console.log(`DEBUGGING (LOG-REQUEST): - Set next log variable`);
			// console.log(`DEBUGGING (LOG-REQUEST): - Disabled instant log interception`);

			// return;
			// wait 0.2 seconds for the log to retract
			setTimeout(() => {
				// console.log(`DEBUGGING (LOG-REQUESTED-RETRACTION): 3. Log "${_log.current.log.content}" retracted succesfully"`);
				// console.log(`DEBUGGING (LOG-REQUESTED-RETRACTION): - Replaced log to the next log "${_log.current.nextLog.content}"`);
				// console.log(`DEBUGGING (LOG-REQUESTED-RETRACTION): - Setting log state to active`);
				// console.log(`DEBUGGING (LOG-REQUESTED-RETRACTION): - Clearing next log variable`);
				// set the current log to the next log requested
				_setLog({
					..._log.current,
					log: {
						..._log.current.nextLog,
						active: true,
						// create a timeout of 2 seconds to automatically retract the log
						timeout: _log.current.nextLog.permanent ? undefined : getAutomaticTimeout(_log.current.nextLog.content), // fetch the entire timeout function that handles what happens after 2 seconds
					},
					nextLog: undefined,
				});
			}, 200);
		} else {
			// console.log(`DEBUGGING (LOG-REQUEST): 2. No log active at the moment, creating log instantly`);
			// if there isn't an active log, check if it might be retracting
			if (!_log.current.canCreateLog) {
				// console.log(`DEBUGGING (LOG-REQUEST): - Failed to create instantly: instant interception is disabled`);
				// console.log(`DEBUGGING (LOG-REQUEST): - Set next log variable`);
				// if it is, set the next log so that after it has finished retracting it will be created
				_setLog({
					..._log.current,
					nextLog: {
						content: content,
						level: level,
						levelColor: iconColors[level],
						permanent: permanent,
					},
				});
			} else {
				// console.log(`DEBUGGING (LOG-REQUEST): - Instant interception is enabled, successfully created log instantly ("${content}" ${level}-${permanent ? 'permanent' : 'temporary'})`);
				// console.log(`DEBUGGING (LOG-REQUEST): - Disabled instant interception`);
				// console.log(`DEBUGGING (LOG-REQUEST): - Set log state to active`);
				// if there isn't a retracting log, just instantly set the log
				_setLog({
					..._log.current,
					log: {
						content: content,
						level: level,
						levelColor: iconColors[level],
						active: true,
						permanent: permanent,
						timeout: permanent ? undefined : getAutomaticTimeout(content), // fetch the entire timeout function that handles what happens after 2 seconds
					},
					canCreateLog: false,
				});
			}
		}
	};

	const positionOverRect = (x, y, rect) => {
		if (x >= rect.x && x <= rect.x + rect.width) {
			if (y >= rect.y && y <= rect.y + rect.height) {
				return true;
			}
		}

		return false;
	};

	const isMouseOverControl = (x, y) => {
		let inner = document.querySelector('.control-inner').getBoundingClientRect();
		let arrow = document.querySelector('.control-arrow').getBoundingClientRect();

		return positionOverRect(x, y, inner) || positionOverRect(x, y, arrow);
	};

	// const onMouseDown = () => {
	// 	_setLog({
	// 		..._log.current,
	// 		drag: true,
	// 	});
	// };

	// const onMouseUp = () => {
	// 	_setLog({
	// 		..._log.current,
	// 		drag: false,
	// 	});
	// };

	// useEffect(() => {
	// 	window.addEventListener('mousedown', onMouseDown);
	// 	window.addEventListener('mouseup', onMouseUp);
	// 	window.addEventListener('touchstart', onMouseDown);
	// 	window.addEventListener('touchend', onMouseUp);
	// }, []);

	return {
		createLog,
		isMouseOverControl,
		positionOverRect,
	};
}

import { Timestamp } from "@firebase/firestore";
import JSZip from 'jszip';
import { saveAs } from "file-saver";
import { Song } from "@/models/song";
import { MusicSheetContainer } from "@/components/constants/types";
import { MusicSheet } from "@/models/music_sheet";
import MusicSheetService from "@/apis/MusicSheetService";

export function getFirebaseTimestampNow() {
  return Timestamp.fromDate(new Date())
}

export function toPlainObject(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

export function getDayByTimestamp(timestamp: Timestamp) {
  if (!timestamp) return ""

  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' }); // 'Mon', 'Tue', etc.
}

export function isTimestampPast(timestamp: Timestamp): boolean {
  const date = new Date(timestamp.seconds * 1000)
  const today = new Date()
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function timestampToDateString(timestamp: Timestamp) {
  if (!timestamp) return "Undefined"

  const jsDate = new Date(timestamp.seconds * 1000); // Explicitly type firestoreTimestamp.seconds as a number

  // Format the JavaScript Date into a string in 'yyyy-mm-dd' format
  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it's zero-indexed
  const day = String(jsDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`
}

export function timestampToDateStringFormatted(timestamp: Timestamp) {
  if (!timestamp) return "Undefined"

  const jsDate = new Date(timestamp.seconds * 1000); // Explicitly type firestoreTimestamp.seconds as a number

  // Define month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Extract year, month, and day from the date
  const year = jsDate.getFullYear();
  const monthIndex = jsDate.getMonth();
  const day = jsDate.getDate();

  // Format the date string
  return `${monthNames[monthIndex]} ${day}, ${year}`;
}

export function getTimePassedFromTimestamp(timestamp: Timestamp) {
  if (!timestamp) return ""

  const jsDate = new Date(timestamp?.seconds * 1000); // Convert Firestore timestamp to JavaScript Date
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - jsDate.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;
  const secondsInMonth = secondsInDay * 30;
  const secondsInYear = secondsInDay * 365;

  let result;

  if (diffInSeconds < secondsInMinute) {
    result = `${diffInSeconds} seconds`;
  }
  else if (diffInSeconds < secondsInHour) {
    const minutes = Math.abs(Math.floor(diffInSeconds / secondsInMinute));
    result = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  else if (diffInSeconds < secondsInDay) {
    const hours = Math.abs(Math.floor(diffInSeconds / secondsInHour));
    result = `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  else if (diffInSeconds < secondsInWeek) {
    const days = Math.abs(Math.floor(diffInSeconds / secondsInDay));
    result = `${days} day${days !== 1 ? 's' : ''}`;
  }
  else if (diffInSeconds < secondsInMonth) {
    const weeks = Math.abs(Math.floor(diffInSeconds / secondsInWeek));
    result = `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  else if (diffInSeconds < secondsInYear) {
    const months = Math.abs(Math.floor(diffInSeconds / secondsInMonth));
    result = `${months} month${months !== 1 ? 's' : ''}`;
  }
  else {
    const years = Math.abs(Math.floor(diffInSeconds / secondsInYear));
    result = `${years} year${years !== 1 ? 's' : ''}`;
  }
  const suffix = (diffInSeconds < 0) ? " left" : " ago"
  return result + suffix;
}

export function getTimePassedFromTimestampShorten(timestamp: Timestamp) {
  if (!timestamp) return ""

  const jsDate = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript Date
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - jsDate.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;
  const secondsInMonth = secondsInDay * 30;
  const secondsInYear = secondsInDay * 365;

  let result;

  if (diffInSeconds < secondsInMinute) {
    result = `${diffInSeconds} sec`;
  }
  else if (diffInSeconds < secondsInHour) {
    const minutes = Math.abs(Math.floor(diffInSeconds / secondsInMinute));
    result = `${minutes} min`;
  }
  else if (diffInSeconds < secondsInDay) {
    const hours = Math.abs(Math.floor(diffInSeconds / secondsInHour));
    result = `${hours} hr${hours !== 1 ? 's' : ''}`;
  }
  else if (diffInSeconds < secondsInWeek) {
    const days = Math.abs(Math.floor(diffInSeconds / secondsInDay));
    result = `${days} day${days !== 1 ? 's' : ''}`;
  }
  else if (diffInSeconds < secondsInMonth) {
    const weeks = Math.abs(Math.floor(diffInSeconds / secondsInWeek));
    result = `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  else if (diffInSeconds < secondsInYear) {
    const months = Math.abs(Math.floor(diffInSeconds / secondsInMonth));
    result = `${months} month${months !== 1 ? 's' : ''}`;
  }
  else {
    const years = Math.abs(Math.floor(diffInSeconds / secondsInYear));
    result = `${years} year${years !== 1 ? 's' : ''}`;
  }

  const suffix = (diffInSeconds < 0) ? " left" : " ago"
  return result + suffix;
}

export function getDayPassedFromTimestampShorten(timestamp: Timestamp) {
  if (!timestamp) return "";

  const jsDate = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript Date
  const now = new Date();

  // Get local date components for comparison
  const postDate = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (postDate.getTime() === today.getTime()) {
    return "Today";
  }

  if (postDate.getTime() === yesterday.getTime()) {
    return "1d ago";
  }

  const diffInSeconds = Math.floor((now.getTime() - jsDate.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;
  const secondsInMonth = secondsInDay * 30;
  const secondsInYear = secondsInDay * 365;

  let result;
  if (diffInSeconds < secondsInWeek) {
    const days = Math.abs(Math.floor(diffInSeconds / secondsInDay));
    result = `${days}d`;
  } else if (diffInSeconds < secondsInMonth) {
    const weeks = Math.abs(Math.floor(diffInSeconds / secondsInWeek));
    result = `${weeks}w`;
  } else if (diffInSeconds < secondsInYear) {
    const months = Math.abs(Math.floor(diffInSeconds / secondsInMonth));
    result = `${months}m`;
  } else {
    const years = Math.abs(Math.floor(diffInSeconds / secondsInYear));
    result = `${years}y`;
  }

  const suffix = diffInSeconds < 0 ? " left" : " ago";

  return result + suffix;
}

export function timestampToDate(timestamp: Timestamp) {
  try {
    return new Date(timestamp.seconds * 1000)
  }
  catch (e) {
    console.log("Err: timestampToDate")
    return new Date()
  }
}

export function OpenYoutubeLink(url: string) {
  if (url) {
    window.open(url, '_blank');
    return;
    // Extract the video ID from the YouTube URL (assuming it is in the standard format)
    const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)?.[1];

    if (videoId) {
      if (isMobile()) {
        window.location.href = `youtube://www.youtube.com/watch?v=${videoId}`;
      }
      else {
        window.open(url, '_blank');
      }
    }
    else {
      window.open(url, '_blank');
    }
  }
}

export function isMobile() {
  // Example of a simple mobile detection function
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isPWA() {
  // Example of a function to detect if the app is running as a PWA
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function emailExists(emails: Array<string>, targetEmail: string) {
  if (emails.map((x) => x.toLowerCase().trim()).includes(targetEmail.toLowerCase().trim())) {
    return true;
  }
  return false;
}


function extractFileType(imageUrl: string) {
  let fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

  // Remove extra strings after '?' if they exist
  const queryIndex = fileName.indexOf('?');
  if (queryIndex !== -1) {
    fileName = fileName.substring(0, queryIndex);
  }

  // Get the file extension from the file name
  return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

}

async function fetchImageAsBlob(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }
  return response.blob();
}


export async function downloadMultipleMusicSheets(songs: Array<Song>) {
  const zip = new JSZip();


  // Add files to the zip
  for (const song of songs) {
    const musicSheets = await MusicSheetService.getSongMusicSheets(song?.id)
    for (const musicSheet of musicSheets) {
      let index = 1
      for (const url of musicSheet?.urls) {
        const blob = await fetchImageAsBlob(url);

        if (musicSheet?.urls?.length > 1) {
          zip.file(`${song?.title} [${musicSheet?.key}]_${index}.${extractFileType(url)}`, blob)
        }
        else {
          zip.file(`${song?.title} [${musicSheet?.key}].${extractFileType(url)}`, blob)
        }
        index += 1
      }
    }
  }

  // Generate the zip file and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'music_sheets.zip');
}

export async function shareMusicSheets(songs: Array<Song>) {
  if (navigator.canShare && navigator.canShare({ files: [new File([], 'test.png')] })) {
    const files: File[] = []

    for (const song of songs) {
      const musicSheets = await MusicSheetService.getSongMusicSheets(song?.id)
      for (const musicSheet of musicSheets) {
        let index = 1
        for (const url of musicSheet?.urls) {
          const blob = await fetchImageAsBlob(url);
          const ext = extractFileType(url);
          // Files must have valid image extensions for sharing
          const fileName = musicSheet?.urls?.length > 1
            ? `${song?.title} [${musicSheet?.key}]_${index}.${ext}`
            : `${song?.title} [${musicSheet?.key}].${ext}`;

          files.push(new File([blob], fileName, { type: blob.type }));
          index += 1
        }
      }
    }

    if (files.length > 0) {
      try {
        await navigator.share({
          files: files,
          title: 'Worship Music Sheets',
          text: 'Here are the music sheets for the worship.',
        });
        return;
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to download if sharing fails/cancelled and it's not an AbortError
        if ((error as Error).name !== 'AbortError') {
          await downloadMultipleMusicSheets(songs);
        }
      }
    }
  } else {
    // Fallback for devices that don't support file sharing
    await downloadMultipleMusicSheets(songs);
  }
}

export function getAllUrlsFromMusicSheetContainers(mContainers: MusicSheetContainer[]) {
  if (!mContainers) {
    console.log("getAllUrlsFromMusicSheetContainers: mContainer is not exists."); return []
  }

  const urls: Array<string> = []
  mContainers?.forEach(mContainer => {
    mContainer?.imageFileContainers?.forEach(iContainer => {
      urls.push(iContainer?.url)
    })
  })
  return urls
}

export function getAllUrlsFromSongMusicSheets(musicSheets: MusicSheet[]) {
  if (!musicSheets) {
    console.log("getAllUrlsFromSongMusicSheets: musicSheets are not exists."); return []
  }

  const urls: Array<string> = []
  musicSheets?.forEach(musicSheet => {
    musicSheet?.urls?.forEach(url => {
      urls.push(url)
    })
  })
  return urls
}

export function getSongTitleFromSongsById(songs: Array<Song>, songId: string) {
  songs?.forEach(song => {
    if (song.id === songId) {
      return song?.title
    }
  })
  return "No title"
}


export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Extracts the initial character for indexing.
 * - English: A-Z (Uppercase)
 * - Hangul: Initial Consonant (ㄱ, ㄴ, ㄷ...)
 * - Others: #
 */
export function getInitialChar(str: string): string {
  if (!str) return '#';

  const char = str.charAt(0);
  const code = char.charCodeAt(0);

  // English (A-Z, a-z)
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
    return char.toUpperCase();
  }

  // Korean (Hangul Syllables)
  // Range: 0xAC00(44032) - 0xD7A3(55203)
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const chosungIndex = Math.floor(((code - 0xAC00) / 28) / 21);
    const CHOSUNG = [
      'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
      'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ];
    return CHOSUNG[chosungIndex] || '#';
  }

  // Korean (Hangul Jamo compatibility)
  // Range: 0x3131(12593) - 0x314E(12622) for modern consonants
  // Range: 0x1100(4352) - 0x11FF(4607) for old jamo
  if ((code >= 0x3131 && code <= 0x314E) || (code >= 0x1100 && code <= 0x11FF)) {
    return char;
  }

  return '#';
}
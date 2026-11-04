import { NATIVE_OPEN_SOURCE_LICENCE_GROUPS } from './nativeOpenSourceLicences.generated';

export interface OpenSourceLicenceGroup {
  title: string;
  packages: string[];
  notice: string;
}

const MIT_TERMS = `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const ISC_TERMS = `Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`;

const mitNotice = (copyright: string): string => `MIT License

${copyright}

${MIT_TERMS}`;

const DIRECT_OPEN_SOURCE_LICENCE_GROUPS: OpenSourceLicenceGroup[] = [
  {
    title: 'BeatNote',
    packages: ['BeatNote 1.0.0'],
    notice: mitNotice('Copyright (c) BeatNote Contributors'),
  },
  {
    title: 'Expo and Expo modules',
    packages: [
      '@expo/metro-runtime 6.1.2',
      'babel-preset-expo 54.0.12',
      'expo 54.0.37',
      'expo-audio 1.1.1',
      'expo-build-properties 1.0.10',
      'expo-dev-client 6.0.21',
      'expo-document-picker 14.0.8',
      'expo-file-system 19.0.24',
      'expo-keep-awake 15.0.8',
      'expo-print 15.0.8',
      'expo-screen-orientation 9.0.9',
      'expo-status-bar 3.0.9',
    ],
    notice: mitNotice('Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)'),
  },
  {
    title: 'React and React Native',
    packages: [
      'react 19.1.0',
      'react-dom 19.1.0',
      'react-native 0.81.5',
    ],
    notice: mitNotice('Copyright (c) Meta Platforms, Inc. and affiliates.'),
  },
  {
    title: 'React Native Async Storage',
    packages: ['@react-native-async-storage/async-storage 2.2.0'],
    notice: mitNotice('Copyright (c) 2015-present, Facebook, Inc.'),
  },
  {
    title: 'Software Mansion libraries',
    packages: [
      'react-native-gesture-handler 2.28.0',
      'react-native-reanimated 4.1.5',
    ],
    notice: mitNotice('Copyright (c) 2016 Software Mansion <swmansion.com>'),
  },
  {
    title: 'React Native Safe Area Context',
    packages: ['react-native-safe-area-context 5.6.2'],
    notice: mitNotice('Copyright (c) 2019 Th3rd Wave'),
  },
  {
    title: 'React Native SVG',
    packages: ['react-native-svg 15.12.1'],
    notice: mitNotice('Copyright (c) 2015-2016 Horcrux'),
  },
  {
    title: 'React Native for Web',
    packages: ['react-native-web 0.21.2'],
    notice: mitNotice('Copyright (c) Nicolas Gallagher.\nCopyright (c) Meta Platforms, Inc. and affiliates.'),
  },
  {
    title: 'Zustand',
    packages: ['zustand 5.0.8'],
    notice: mitNotice('Copyright (c) 2019 Paul Henschel'),
  },
  {
    title: 'Lucide',
    packages: ['lucide-react-native 0.554.0'],
    notice: `ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT).
All other copyright (c) for Lucide are held by Lucide Contributors 2025.

${ISC_TERMS}`,
  },
];

export const OPEN_SOURCE_LICENCE_GROUPS: OpenSourceLicenceGroup[] = [
  ...DIRECT_OPEN_SOURCE_LICENCE_GROUPS,
  ...NATIVE_OPEN_SOURCE_LICENCE_GROUPS.map(group => ({
    ...group,
    title: `Native: ${group.title}`,
  })),
];

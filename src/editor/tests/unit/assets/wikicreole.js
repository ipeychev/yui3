YUI.add('wikicreole-tests', function(Y) {
    
    var href = window.location.href,

    editor = new Y.EditorBase(
        {
            plugins: [
                {
                    fn: Y.Plugin.WikiCreole,
                    cfg: {
                        ignoreImgPrefix: href.substr(0, href.lastIndexOf('/') + 1)
                    }
                }
            ]
        }
    ),

    IElt9 = Y.UA.ie && Y.UA.ie < 9,
    
    template = {
        name: 'WikiCreole Tests',

        test_basicParagraphMarkup: function() {
            editor.set(
                'content',
                '<p>Basic paragraph test with &lt;, &gt;, &amp; and "</p>'
            );

            Y.Assert.areSame(
                'Basic paragraph test with <, >, & and "\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_simpleUnorderedList: function() {
            editor.set(
                'content',
                '<ul><li> list item</li>\n<li>list item 2</li></ul>'
            );

            Y.Assert.areSame(
                '* list item\n*list item 2\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_simpleOrderedList: function() {
            editor.set(
                'content',
                '<ol><li> list item</li>\n<li>list item 2</li></ol>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '# list item\n#list item 2\n\n',
                'Values should be the same'
            );
        },

        test_unorderedItemWithUnorderedSublist: function() {
            editor.set(
                'content',
                '<ul><li> Item<ul>\n<li> Subitem</li></ul></li></ul>'
            );

            Y.Assert.areSame(
                '* Item\n** Subitem\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_orderedItemWithOrderedSublist: function() {
            editor.set(
                'content',
                '<ol><li> Item<ol>\n<li> Subitem</li></ol></li></ol>'
            );

            Y.Assert.areSame(
                '# Item\n## Subitem\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_orderedSublistWithoutInitialTag: function() {
            editor.set(
                'content',
                '<p>## Sublist item</p>'
            );

            Y.Assert.areSame(
                '## Sublist item\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_unorderedItemWithOrderedSublist: function() {
            editor.set(
                'content',
                '<ul><li> Item<ol><li> Subitem</li></ol></li></ul>'
            );

            Y.Assert.areSame(
                '* Item\n## Subitem\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_multilineUnorderedItem: function() {
            editor.set(
                'content',
                '<ul><li> Item<br>still continues</li></ul>'
            );

            Y.Assert.areSame(
                '* Item\\\\still continues\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_multilineOrderedItem: function() {
            editor.set(
                'content',
                '<ol><li> Item<br>still continues</li></ol>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '# Item\\\\still continues\n\n',
                'Values should be the same'
            );
        },
  
        test_unordered_list_and_paragraph: function() {
            editor.set(
                'content',
                '<ul><li> Item</li><br></ul><p>\nParagraph</p>'
            );

            Y.Assert.areSame(
                '* Item\\\\\n\nParagraph\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_orderedListAndParagraph: function() {
            editor.set(
                'content',
                '<ol><li> Item</li>\n</ol><p>\nParagraph</p>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '# Item\n\nParagraph\n\n',
                'Values should be the same'
            );
        },

        test_unorderedListWithLeadingWhitespace: function() {
            editor.set(
                'content',
                '\t<ul><li>Item</li></ul>'
            );

            Y.Assert.areSame(
                '*Item\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_orderedListWithLeadingWhitespace: function() {
            editor.set(
                'content',
                '\t<ol><li>Item</li></ol>'
            );

            Y.Assert.areSame(
                '#Item\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_unorderedListWithBolditem: function() {
            editor.set(
                'content',
                '<ul><li> Item</li>\n<li> <strong>Bold item</strong></li></ul>'
            );

            Y.Assert.areSame(
                '* Item\n* **Bold item**\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_orderedListWithBoldItem: function() {
            editor.set(
                'content',
                '<ol><li> Item</li>\n<li> <strong>Bold item</strong></li></ol>'
            );

            Y.Assert.areSame(
                '# Item\n# **Bold item**\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_orderedListInsideUnorderedList: function() {
            editor.set(
                'content',
                '<ul><li> Item<ol>\n<li> Subitem</li></ol></ul>'
            );

            Y.Assert.areSame(
                '* Item\n## Subitem\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_horizontal_rule: function() {
            editor.set(
                'content',
                '<p>Some text</p><hr /><p>Some more text</p>'
            );

            Y.Assert.areSame(
                'Some text\n\n----\n\nSome more text\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
  
        test_preformatted_block: function() {
            editor.set(
                'content',
                '<pre>Preformatted block\n</pre>'
            );

            Y.Assert.areSame(
                '{{{\nPreformatted block\n}}}\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_twoPreformattedBlocks: function() {
            editor.set(
                'content',
                '<pre>Preformatted block\n</pre><p><tt>Block 2</tt></p>'
            );

            Y.Assert.areSame(
                '{{{\nPreformatted block\n}}}\n\n{{{Block 2}}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_spaceEscapesNowiki: function () {
            editor.set(
              'content',
              '<pre>Preformatted block\n}}}\n</pre>'
            );

            Y.Assert.areSame(
                '{{{\nPreformatted block\n}}}\n}}}\n',
              editor.getContent(),
                'Values should be the same'
            );
        },

        test_inlineNowikiWithTrailingBraces: function() {
            editor.set(
              'content',
              '<p><tt>foo}}}</tt></p>'
            );

            Y.Assert.areSame(
              editor.getContent(),
              '{{{foo}}}}}}\n\n',
                'Values should be the same'
            );
        },

        test_h1: function() {
            editor.set(
              'content',
              '<h1>Header</h1>'
            );

            Y.Assert.areSame(
                '= Header =\n',
              editor.getContent(),
                'Values should be the same'
            );
        },

        test_h2: function() {
            editor.set(
                'content',
                '<h2>Header</h2>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '== Header ==\n',
                'Values should be the same'
            );
        },

        test_h3: function() {
            editor.set(
                'content',
                '<h3>Header</h3>'
            );

            Y.Assert.areSame(
                '=== Header ===\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_h4: function() {
            editor.set(
              'content',
              '<h4>Header</h4>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '==== Header ====\n',
                'Values should be the same'
            );
        },

        test_h5: function() {
            editor.set(
                'content',
                '<h5>Header</h5>'
            );

            Y.Assert.areSame(
                '===== Header =====\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_h6: function() {
            editor.set(
                'content',
                '<h6>Header</h6>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '====== Header ======\n',
                'Values should be the same'
            );
        },

        test_h1Spaces: function() {
            editor.set(
                'content',
                '<h1> Header </h1>'
            );

            Y.Assert.areSame(
                '=  Header  =\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_h2Spaces: function() {
            editor.set(
                'content',
                '<h2> Header </h2>'
            );

            Y.Assert.areSame(
                '==  Header  ==\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_h3Spaces: function() {
            editor.set(
                'content',
                '<h3> Header </h3>'
            );

            Y.Assert.areSame(
                '===  Header  ===\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_NoSpaces: function() {
            editor.set(
                'content',
                '<h4> Header </h4>'
            );

            Y.Assert.areSame(
                '====  Header  ====\n',
              editor.getContent(),
                'Values should be the same'
            );
        },

        test_h5Spaces: function() {
            editor.set(
                'content',
                '<h5> Header </h5>'
            );

            Y.Assert.areSame(
                '=====  Header  =====\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_h6Spaces: function() {
            editor.set(
                'content',
                '<h6> Header </h6>'
            );

            Y.Assert.areSame(
                '======  Header  ======\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_headerLike: function() {
            editor.set(
                'content',
                '<p>====\n</p>'
            );

            Y.Assert.areSame(
                '====\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_gth6: function() {
            editor.set(
                'content',
                '<p>======= Header =</p>'
            );

            Y.Assert.areSame(
                '======= Header =\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_h1EndingWithTilde: function() {
            editor.set(
                'content',
                '<h1>Header ~</h1>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '= Header ~ =\n',
                'Values should be the same'
            );
        },

       test_h2EndingWithTilde: function() {
            editor.set(
                'content',
                '<h2>Header ~</h2>'
            );

            Y.Assert.areSame(
                '== Header ~ ==\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_h3EndingWithTilde: function() {
            editor.set(
                'content',
                '<h3>Header ~</h3>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '=== Header ~ ===\n',
                'Values should be the same'
            );
        },
        
        test_h4EndingWithTilde: function() {
            editor.set(
                'content',
                '<h4>Header ~</h4>'
            );

            Y.Assert.areSame(
                '==== Header ~ ====\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_h5EndingWithTilde: function() {
            editor.set(
                'content',
                '<h5>Header ~</h5>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '===== Header ~ =====\n',
                'Values should be the same'
            );
        },

        test_h6EndingWithTilde: function() {
            editor.set(
                'content',
                '<h6>Header ~</h6>'
            );

            Y.Assert.areSame(
                '====== Header ~ ======\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_tables: function() {
            editor.set(
                'content',
                '<table><tr><td> A </td><td> B </td></tr>' +
                '<tr><td> C </td><td> D </td></tr></table>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '| A | B |\n| C | D |\n'
            );
        },

        test_tablesWithoutTrailingPipe: function() {
            editor.set(
                'content',
                '<table><tr><td> A </td><td> B</td></tr>' +
                '<tr><td> C </td><td> D</td></tr></table>'
            );

            Y.Assert.areSame(
                '| A | B|\n| C | D|\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_tableHeaders: function() {
            editor.set(
                'content',
                '<table><tr><th> A </th><td> B </td></tr>' +
                '<tr><td> C </td><th> D </th></tr></table>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '|= A | B |\n| C |= D |\n',
                'Values should be the same'
            );
        },

        test_tableInlineMarkup: function() {
            editor.set(
                'content',
                '<table><tr><td> A </td><td> B </td></tr>' + '<tr><td> <em>C</em> </td>' +
                '<td> <strong>D</strong> <br /> E </td></tr></table>'
            );

            Y.Assert.areSame(
                '| A | B |\n|//C//|**D**\\\\ E |\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedTableInlineMarkup: function() {
            editor.set(
                'content',
                '<table><tr><td> A </td><td> B </td></tr>' + '<tr><td> <tt>//C//</tt> </td>' +
                '<td> <tt>**D** \\\\ E</tt> </td></tr></table>'
            );

            Y.Assert.areSame(
                '| A | B |\n|{{{//C//}}}|{{{**D** \\\\ E}}}|\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_rawURL: function() {
            editor.set(
                'content',
                '<p><a href="http://example.com/examplepage">' +
                'http://example.com/examplepage</a></p>'
            );

            Y.Assert.areSame(
                '[[http://example.com/examplepage|http://example.com/examplepage]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_rawURLWithTilde: function() {
            editor.set(
                'content',
                '<p><a href="http://example.com/~user">' +
                'http://example.com/~user</a></p>'
            );

            Y.Assert.areSame(
                '[[http://example.com/~user|http://example.com/~user]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_unnamedURL: function() {
            editor.set(
                'content',
                '<p><a href="http://example.com/examplepage">' +
                'http://example.com/examplepage</a></p>'
            );

            Y.Assert.areSame(
                '[[http://example.com/examplepage|http://example.com/examplepage]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_unnamedURLWithTilde: function() {
            editor.set(
                'content',
                '<p><a href="http://example.com/~user">' +
                'http://example.com/~user</a></p>'
            );

            Y.Assert.areSame(
                '[[http://example.com/~user|http://example.com/~user]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_namedURL: function() {
            editor.set(
                'content',
                '<p><a href="http://example.com/examplepage">Example Page</a></p>'
            );

            Y.Assert.areSame(
                editor.getContent(),
                '[[http://example.com/examplepage|Example Page]]\n\n',
                'Values should be the same'
            );
        },

        test_namedLink: function() {
            editor.set(
                'content',
                '<p><a href="/wiki/MyPage">MyPage</a></p>'
            );

            Y.Assert.areSame(
                '[[/wiki/MyPage|MyPage]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_image: function() {
            editor.set(
                'content',
                '<p><img alt="my image" src="assets/yui.png"/></p>'
            );

            Y.Assert.areSame(
                '{{assets/yui.png|my image}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_inlineTt: function() {
            editor.set(
                'content',
                '<p>Inline <tt>tt</tt> example <tt>here</tt>!</p>'
            );

            Y.Assert.areSame(
                'Inline {{{tt}}} example {{{here}}}!\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_strong: function() {
            editor.set(
                'content',
                '<p><strong>Strong</strong></p>'
            );

            Y.Assert.areSame(
                '**Strong**\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_runawayStrong1: function() {
            editor.set(
                'content',
                '<p><strong>Strong</strong></p>'
            );

            Y.Assert.areSame(
                '**Strong**\n\n',
              editor.getContent(),
                'Values should be the same'
            );
        },

        test_runawayStrong2: function() {
            editor.set(
                'content',
                '<p><strong> Strong *</strong></p>'
            );

            Y.Assert.areSame(
                '** Strong ***\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_emphasis: function() {
            editor.set(
                'content',
                '<p><em>Emphasis</em></p>'
            );
            
            Y.Assert.areSame(
                '//Emphasis//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        runawayEmphasis1: function() {
            editor.set(
                'content',
                '<p><em>Emphasis</em></p>'
            );
            
            Y.Assert.areSame(
                '//Emphasis//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        runawayEmphasis2: function() {
            editor.set(
                'content',
                '<p><em> Emphasis /</em></p>'
            );

            Y.Assert.areSame(
                '// Emphasis /\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_multiLineEmphasis: function() {
            editor.set(
                'content',
                '<p>Bold and italics should <em>be able</em> to cross lines.' +
                '\n</p>' + '<p>\nBut, should <em>not be...\n</em></p>' +
                '<p>\n...able<em> to cross paragraphs.</em></p>'
            );

            Y.Assert.areSame(
                'Bold and italics should //be able// to cross lines.\n\n' +
                'But, should //not be...//\n\n' +
                '...able// to cross paragraphs.//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_URLEmphasisAmbiguity: function() {
            editor.set(
                'content',
                '<p>This is an <em>italic</em> text. This is a url: ' +
                '<a href="http://www.wikicreole.org">' +
                'http://www.wikicreole.org</a>. This is what can go wrong:' +
                '<em>this should be an italic text</em>.</p>'
            );

            Y.Assert.areSame(
                'This is an //italic// text. This is a url: ' +
                '[[http://www.wikicreole.org|http://www.wikicreole.org]]. This is what can go wrong://this ' +
                'should be an italic text//.\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_difficultEmphasis1: function() {
            editor.set(
                'content',
                '<p><em> <a href="http://www.link.org">' +
                'http://www.link.org</a> </em></p>'
            );
            
            Y.Assert.areSame(
                '//[[http://www.link.org|http://www.link.org]]//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis2: function() {
            editor.set(
                'content',
                '<p><em> http </em></p>'
            );

            Y.Assert.areSame(
                '// http //\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis3: function() {
            editor.set(
                'content',
                '<p><em> httphpthtpht </em></p>'
            );
            
            Y.Assert.areSame(
                '// httphpthtpht //\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis4: function() {
            editor.set(
                'content',
                '<p><em> http: </em></p>'
            );
            
            Y.Assert.areSame(
                '// http: //\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis5Runaway: function() {
            editor.set(
                'content',
                '<p><em> <a href="http://example.org">http://example.org</a></em></p>'
            );

            Y.Assert.areSame(
                '//[[http://example.org|http://example.org]]//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis6Runaway: function() {
            editor.set(
                'content',
                '<p><em> <a href="http://example.org//">http://example.org//</a></em></p>'
            );
            
            Y.Assert.areSame(
                '//[[http://example.org//|http://example.org//]]//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis7: function() {
            editor.set(
                'content',
                '<p><em>httphpthtphtt</em></p>'
            );
            
            Y.Assert.areSame(
                '//httphpthtphtt//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis8: function() {
            editor.set(
                'content',
                '<p><em> <a href="ftp://www.link.org">' + 'ftp://www.link.org</a> </em></p>'
            );

            Y.Assert.areSame(
                '//[[ftp://www.link.org|ftp://www.link.org]]//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis9: function() {
            editor.set(
                'content',
                '<p><em> ftp </em></p>'
            );
            
            Y.Assert.areSame(
                '// ftp //\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis10: function() {
            editor.set(
                'content',
                '<p><em> fttpfptftpft </em></p>'
            );

            Y.Assert.areSame(
                '// fttpfptftpft //\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis11: function() {
            editor.set(
                'content',
                '<p><em> ftp: </em></p>'
            );

            Y.Assert.areSame(
                '// ftp: //\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis12Runaway: function() {
            editor.set(
                'content',
                '<p><em> <a href="ftp://example.org">ftp://example.org</a></em></p>'
            );

            Y.Assert.areSame(
                '//[[ftp://example.org|ftp://example.org]]//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis13Runaway: function() {
            editor.set(
                'content',
                '<p><em><a href="ftp://username:password@example.org/path//">' + 'ftp://username:password@example.org/path//</a></em></p>'
            );

            Y.Assert.areSame(
                '//[[ftp://username:password@example.org/path//|ftp://username:password@example.org/path//]]//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis14: function() {
            editor.set(
                'content',
                '<p><em>fttpfptftpftt</em></p>'
            );

            Y.Assert.areSame(
                '//fttpfptftpftt//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_difficultEmphasis15: function() {
            editor.set(
                'content',
                '<p><em><a href="ftp://username:password@link.org/path/">' +
                'ftp://username:password@link.org/path/</a></em></p>'
            );

            Y.Assert.areSame(
                '//[[ftp://username:password@link.org/path/|ftp://username:password@link.org/path/]]//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedEmphasis: function() {
            editor.set(
                'content',
                '<p><span class="escaped">/</span>/Not emphasized<span class="escaped">/</span>/</p>'
            );
            
            Y.Assert.areSame(
                '~//Not emphasized~//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_tildeEscapesSelf: function() {
            editor.set(
                'content',
                '<p>Tilde: <span class="escaped">~</span></p>'
            );
            
            Y.Assert.areSame(
                'Tilde: ~~\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedURL: function() {
            editor.set(
                'content',
                '<p><span class="escaped">http://link.org</span></p>'
            );
            
            Y.Assert.areSame(
                '~http://link.org\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedStrongEnding: function() {
            editor.set(
                'content',
                '<p>Plain <strong> bold <span class="escaped">*</span>* bold too</strong></p>'
            );
            
            Y.Assert.areSame(
                'Plain ** bold ~** bold too**\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedEmphasisEnding: function() {
            editor.set(
                'content',
                '<p>Plain <em> emphasized <span class="escaped">/</span>/ emphasized too</em></p>'
            );

            Y.Assert.areSame(
                'Plain // emphasized ~// emphasized too//\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapeH1Ending: function() {
            editor.set(
                'content',
                '<h1>Header <span class="escaped">=</span></h1>'
            );
            
            Y.Assert.areSame(
                '= Header ~= =\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedH2Ending: function() {
            editor.set(
                'content',
                '<h2>Header <span class="escaped">=</span></h2>'
            );
            
            Y.Assert.areSame(
                 '== Header ~= ==\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedH3Ending: function() {
            editor.set(
                'content',
                '<h3>Header <span class="escaped">=</span></h3>'
            );
            
            Y.Assert.areSame(
                '=== Header ~= ===\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedH4Ending: function() {
            editor.set(
                'content',
                '<h4>Header <span class="escaped">=</span></h4>'
            );
            
            Y.Assert.areSame(
                '==== Header ~= ====\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedH5Ending: function() {
            editor.set(
                'content',
                '<h5>Header <span class="escaped">=</span></h5>'
            );

            Y.Assert.areSame(
                '===== Header ~= =====\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedH6Ending: function() {
            editor.set(
                'content',
                '<h6>Header <span class="escaped">=</span></h6>'
            );
            
            Y.Assert.areSame(
                '====== Header ~= ======\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedLinkEnding1: function() {
            editor.set(
                'content',
                '<p><a href="/wiki/Link]">Link<span class="escaped">]</span></a></p>'
            );
            
            Y.Assert.areSame(
                '[[/wiki/Link]|Link~]]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedLinkEnding2: function() {
            editor.set(
                'content',
                '<p><a href="/wiki/Link]]">Link]<span class="escaped">]</span></a></p>'
            );
            
            Y.Assert.areSame(
                '[[/wiki/Link]]|Link]~]]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedLinkEnding3: function() {
            editor.set(
                'content',
                '<p>[[Link<span class="escaped">]</span>]</p>'
            );
            
            Y.Assert.areSame(
                '[[Link~]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedLineEnding4: function() {
            editor.set(
                'content',
                '<p><a href="/wiki/Link">some text<span class="escaped">]</span></a></p>'
            );
            
            Y.Assert.areSame(
                '[[/wiki/Link|some text~]]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedLinkTextSeparator1: function() {
            editor.set(
                'content',
                '<p><a href="/wiki/Link|some text">Link<span class="escaped">|</span>some text</a></p>'
            );
            
            Y.Assert.areSame(
                '[[/wiki/Link|some text|Link~|some text]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedLinkTextSeparator2: function() {
            editor.set(
                'content',
                '<p><a href="/wiki/Link|">some text</a></p>'
            );
            
            Y.Assert.areSame(
                '[[/wiki/Link||some text]]\n\n',
              editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedLinkTextSeparator3: function() {
            editor.set(
                'content',
                '<p><a href="/wiki/Link"><span class="escaped">|</span>some text</a></p>'
            );

            Y.Assert.areSame(
                '[[/wiki/Link|~|some text]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedImgEnding1: function() {
            editor.set(
                'content',
                '<p><img alt="Alternative text}" src="assets/yui.png"/></p>'
            );

            Y.Assert.areSame(
                '{{assets/yui.png|Alternative text~}}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedImgEnding2: function() {
            editor.set(
                'content',
                '<p><img alt="Alternative text}}" src="assets/yui.png"/></p>'
            );
            
            Y.Assert.areSame(
                '{{assets/yui.png|Alternative text}~}}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedImgEnding3: function() {
            editor.set(
                'content',
                '<p>{{assets/yui.png|Alternative text<span class="escaped">}</span>}</p>'
            );

            Y.Assert.areSame(
                '{{assets/yui.png|Alternative text~}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_escapedImgEnding4: function() {
            editor.set(
                'content',
                '<p><img alt="Alternative}} text" src="assets/yui.png"/></p>'
            );
            
            Y.Assert.areSame(
                '{{assets/yui.png|Alternative}~} text}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_imageURIWithTilde1: function() {
            editor.set(
                'content',
                '<p><img alt="Alternative text" src="assets/yui.png~"/></p>'
            );
            
            Y.Assert.areSame(
                '{{assets/yui.png~|Alternative text}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_imageURIWithTilde2: function() {
            editor.set(
                'content',
                '<p><img alt="|Alternative text" src="assets/yui.png~"/></p>'
            );
            
            Y.Assert.areSame(
                '{{assets/yui.png~||Alternative text}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_tablesWithEscapedSeparator: function() {
            editor.set(
                'content',
                '<table><tr><td> A </td><td> B </td></tr>' +
                '<tr><td> C </td><td> D <span class="escaped">|</span> E </td></tr></table>'
            );
            
            Y.Assert.areSame(
                '| A | B |\n| C | D ~| E |\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_imageInLink: function() {
            editor.set(
                'content',
                '<p><a href="/wiki/Link">Before <img alt="Alternate" src="assets/yui.png"/> After</a></p>'
            );
            
            Y.Assert.areSame(
                '[[/wiki/Link|Before {{assets/yui.png|Alternate}} After]]\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_preformattedBlockCR: function() {
            editor.set(
                'content',
                '<pre>some text \nsome text \n</pre>'
            );

            Y.Assert.areSame(
                '{{{\nsome text \nsome text \n}}}\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_blockCR: function() {
            editor.set(
                'content',
                '<p>some text \nsome \ntext </p>'
            );
            
            Y.Assert.areSame(
                'some text some text \n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_namedLinkInTable: function() {
            editor.set(
                'content',
                '<table><tr><td> <a href="/wiki/MyLink">My link</a> </td></tr></table>'
            );

            Y.Assert.areSame(
                '|[[/wiki/MyLink|My link]]|\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_imageInTable: function() {
            editor.set(
                'content',
                '<table><tr><td> <img alt="Alternative text" src="assets/yui.png"/> </td></tr></table>'
            );
            
            Y.Assert.areSame(
                '|{{assets/yui.png|Alternative text}}|\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_imageInTableStrict: function() {
            editor.set(
                'content',
                '<table><tr><td> {{assets/yui.png</td><td>Alternative text}} </td></tr></table>'
            );

            Y.Assert.areSame(
                '| {{assets/yui.png|Alternative text}} |\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_imageInNamedLinkInTable: function() {
            editor.set(
                'content',
                '<table><tr><td> <a href="/wiki/Link"><img alt="Alternative text" src="assets/yui.png"/></a> </td></tr></table>'
            );
            
            Y.Assert.areSame(
                '|[[/wiki/Link|{{assets/yui.png|Alternative text}}]]|\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_imageWithoutAlternativeText: function() {
            editor.set(
                'content',
                '<p><img alt="" src="assets/yui.png"/></p>'
            );
            
            Y.Assert.areSame(
                '{{assets/yui.png}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },
        
        test_imageWithoutAlternativeTextStrict: function() {
            editor.set(
                'content',
                '<p>{{assets/yui.png}}</p>'
            );
            
            Y.Assert.areSame(
                '{{assets/yui.png}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_imageWithEmptyAlternativeText: function() {
            editor.set(
                'content',
                '<p><img alt="" src="assets/yui.png"/></p>'
            );
            
            Y.Assert.areSame(
                '{{assets/yui.png}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        test_imageWithCustomDefaultAlternativeText: function() {
            editor.set(
                'content',
                '<p><img alt="Image" src="assets/yui.png"/></p>'
            );
            
            Y.Assert.areSame(
                '{{assets/yui.png|Image}}\n\n',
                editor.getContent(),
                'Values should be the same'
            );
        },

        _should: {
            fail: {
                /*
                 * These tests fail in IE < 9 because the produced code is valid, but different than expected in the tests.
                 */
                test_simpleUnorderedList: IElt9,
                test_simpleOrderedList: IElt9,
                test_unorderedItemWithUnorderedSublist: IElt9,
                test_orderedItemWithOrderedSublist: IElt9,
                test_unorderedItemWithOrderedSublist: IElt9,
                test_multilineUnorderedItem: IElt9,
                test_multilineOrderedItem: IElt9,
                test_unordered_list_and_paragraph: IElt9,
                test_orderedListAndParagraph: IElt9,
                test_unorderedListWithBolditem: IElt9,
                test_orderedListWithBoldItem: IElt9,
                test_orderedListInsideUnorderedList: IElt9,
                test_preformatted_block: IElt9,
                test_twoPreformattedBlocks: IElt9,
                test_spaceEscapesNowiki: IElt9,
                test_h1Spaces: IElt9,
                test_h2Spaces: IElt9,
                test_h3Spaces: IElt9,
                test_NoSpaces: IElt9,
                test_h5Spaces: IElt9,
                test_h6Spaces: IElt9,
                test_headerLike: IElt9,
                test_tables: IElt9,
                test_tablesWithoutTrailingPipe: IElt9,
                test_tableHeaders: IElt9,
                test_tableInlineMarkup: IElt9,
                test_escapedTableInlineMarkup: IElt9,
                test_namedLink: IElt9,
                test_runawayStrong2: IElt9,
                test_multiLineEmphasis: IElt9,
                test_URLEmphasisAmbiguity: IElt9,
                test_difficultEmphasis1: IElt9,
                test_difficultEmphasis2: IElt9,
                test_difficultEmphasis3: IElt9,
                test_difficultEmphasis4: IElt9,
                test_difficultEmphasis5Runaway: IElt9,
                test_difficultEmphasis8: IElt9,
                test_difficultEmphasis9: IElt9,
                test_difficultEmphasis10: IElt9,
                test_difficultEmphasis11: IElt9,
                test_difficultEmphasis12Runaway: IElt9,
                test_escapedStrongEnding: IElt9,
                test_escapedEmphasisEnding: IElt9,
                test_escapedLinkEnding1: IElt9,
                test_escapedLinkEnding2: IElt9,
                test_escapedLineEnding4: IElt9,
                test_escapedLinkTextSeparator1: IElt9,
                test_escapedLinkTextSeparator2: IElt9,
                test_escapedLinkTextSeparator3: IElt9,
                test_tablesWithEscapedSeparator: IElt9,
                test_imageInLink: IElt9,
                test_preformattedBlockCR: IElt9,
                test_namedLinkInTable: IElt9,
                test_imageInTableStrict: IElt9,
                test_imageInNamedLinkInTable: IElt9
            }
        }
    };

    var suite = new Y.Test.Suite('WikiCreole');
    
    suite.add(new Y.Test.Case(template));

    Y.Test.Runner.add(suite);

    editor.on(
        'ready',
        function(event) {
            Y.Test.Runner.run();
        }
    );

    editor.render('#editor');
});

$(document).ready(function() {

  var current_page = 0;
  var total_pages;

  var activate_page = {

    init: function() {
      activate_page.bind();
    },
    bind: function() {

      Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [this.getFullYear(),
          (mm > 9 ? '' : '0') + mm,
          (dd > 9 ? '' : '0') + dd
        ].join('-');
      };

      if (location.pathname == '/') {

        $.ajax({
          url: '/load_data',
          type: 'get',
          datatype: 'json',
          error: function() {
            alert('Error caused');
          },
          success: function(result) {

            if (result.current_page == undefined || result.current_page == null) {
              current_page = 0;
            }

            current_page = result.current_page;
            activate_page.activate(current_page, result.data, result.email);
            activate_page.move_pages(result.data, result.email);
            total_pages = result.data.length - 1;

            if (location.search != '') {
              //무슨 키워드를 검색했을 때는 페이지 이동이 없어야 한다.
              var keyword = decodeURI(location.search.split('=')[1]);
              activate_page.search_find(keyword, result.data);
            }

          },
        })

      } else if (location.href.includes('_id')) {

        $.ajax({
          url: '/get_modify_data',
          type: 'get',
          datatype: 'json',
          data: {
            _id: location.search.split('=')[1],
          },
          error: function() {
            alert('Error caused');
          },
          success: function(result) {

            if (result.data.proj_start_date == null || result.data.proj_start_date == undefined) {
              var proj_start_date = '';
            } else {
              var proj_start_date = new Date(result.data.proj_start_date).yyyymmdd();
            }

            if (result.data.proj_end_date == null || result.data.proj_end_date == undefined) {
              var proj_end_date = '';
            } else {
              var proj_end_date = new Date(result.data.proj_end_date).yyyymmdd();
            }

            $('.txt_wrapper').append('<input type = "text" name = "_id" value = ' + location.search.split('=')[1] + ' style = "display:none;">');

            if (result.data.proj_title != undefined || result.data.proj_title != null) {
              $('#proj_title').val(result.data.proj_title);
            }

            if (result.data.proj_category != undefined || result.data.proj_category != null) {
              $('#proj_category').val(result.data.proj_category);
            }

            if (result.data.proj_division != undefined || result.data.proj_division != null) {
              for (var i = 0; i < result.data.proj_division.length; i++) {
                $('input[value="' + result.data.proj_division[i] + '"]').prop('checked', true);
              }
            }

            $('input[name="proj_start_date"]').val(proj_start_date);
            $('input[name="proj_end_date"]').val(proj_end_date);

            if (result.data.proj_location != undefined || result.data.proj_location != null) {
              $('#proj_location').val(result.data.proj_location);
            }

            if (result.data.proj_target != undefined || result.data.proj_target != null) {
              $('#proj_target').val(result.data.proj_target);
            }

            if (result.data.proj_detail != undefined || result.data.proj_detail != null) {
              $('#proj_detail').val(result.data.proj_detail);
            }

            $('<ul></ul>').insertBefore($(".img_column").filter(".concept_img").filter('.register').find('.img_regi_btn').filter('.material-icons'));
            $('<ul></ul>').insertBefore($(".img_column").filter(".reference_img").filter('.register').find('.img_regi_btn').filter('.material-icons'));

            if (result.data.concept_images != undefined || result.data.concept_images != null) {
              for (var i = 0; i < result.data.concept_images.length; i++) {
                $('.img_column').filter(".concept_img").find('ul').append('<li><img class = "usage_img modify" src = "/images/concept_images/' + result.data.concept_images[i] + '"><div class = "img_delete_regist material-icons concept" name = ' + i + '>clear</div></li>');
              }
            }

            if (result.data.reference_images != undefined || result.data.reference_images != null) {
              for (var i = 0; i < result.data.reference_images.length; i++) {
                $('.img_column').filter(".reference_img").find('ul').append('<li><img class = "usage_img modify" src = "/images/reference_images/' + result.data.reference_images[i] + '"><div class = "img_delete_regist material-icons reference" name = ' + i + '>clear</div></li>')
              }
            }

            $('#regist_button').text('수정하기');

          }

        })

      }

    },
    activate: function(current_page, data, email) {

      $.ajax({
        url: '/save_current_page',
        type: 'post',
        datatype: 'json',
        data: {
          current_page: current_page,
        },
        error: function() {
          alert('Error caused');
        },
        success: function(result) {}
      });

      if (data[current_page].proj_start_date != undefined || data[current_page].proj_start_date != null) {
        var event_start_date = new Date(data[current_page].proj_start_date);
      } else {
        var event_start_date = '';
      }

      if (data[current_page].proj_end_date != undefined || data[current_page].proj_end_date != null) {
        var event_end_date = new Date(data[current_page].proj_end_date);
      } else {
        var event_end_date = '';
      }

      //$('.usage_img').remove();
      $('li').removeClass('highlight');
      $('.sub_index').removeClass('highlight');
      $('.sub_index').removeClass('span_selected');
      $('.material-icons').filter('.expand').text('expand_more');
      $('.img_column').find('ul').html('');
      $('.sub_index').html('');
      $('.proj_title').html('');
      $('.proj_detail').html('');
      $('.date').html('');
      $('.location').html('');
      $('.target').html('');
      $('input[name="_id"]').remove();

      for (var i = 0; i < data.length; i++) {

        var title;

        if (i == current_page) {
          title = '<li class = "highlight">' + data[i].proj_title + '</li>'
        } else {
          title = '<li>' + data[i].proj_title + '</li>'
        }

        switch (data[i].proj_category) {
          case '국가 대형 프로젝트 및 대규모 이벤트':
            $('.sub_index').eq(0).append(title)
            break;
          case '기업문화 이벤트 및 마케팅':
            $('.sub_index').eq(1).append(title)
            break;
          case '브랜드 인지도 및 체험':
            $('.sub_index').eq(2).append(title)
            break;
          case '연출행사':
            $('.sub_index').eq(3).append(title)
            break;
          case '사내 이벤트 및 캠페인':
            $('.sub_index').eq(4).append(title)
            break;
          case '브랜드 유통 채널 마케팅':
            $('.sub_index').eq(5).append(title)
            break;
        }

      }

      $('.highlight').parent().addClass('span_selected');
      $('.highlight').parent().prev().children().text('expand_less');
      $('.highlight').parent().prev().addClass('highlight');

      if (email == data[current_page].regist_email || email.includes('fmtech.io')) {
        $('.modify_delete').remove();
        $('<div class="modify_delete"><i class="material-icons modify">edit</i><i class="material-icons delete">delete</i></div>').insertBefore($('.txt_card'));

        for (var i = 0; i < data[current_page].concept_images.length; i++) {
          // $('.img_column').filter('.concept_img').find('ul').append('<li><img class="usage_img" src="/images/concept_images/' + data[current_page].concept_images[i] + '" alt="' + data[current_page].proj_category + '"><div class = "img_delete material-icons concept">clear</div></li>');
          $('.img_column').filter('.concept_img').find('ul').append('<li><a href="/images/concept_images/' + data[current_page].concept_images[i] + '" data-fancybox="gallery"><img class="usage_img" src="/images/concept_images/' + data[current_page].concept_images[i] + '" alt="' + data[current_page].proj_category + '"></a><div class = "img_delete material-icons concept">clear</div></li>');
        }

        for (var i = 0; i < data[current_page].reference_images.length; i++) {
          // $('.img_column').filter('.reference_img').find('ul').append('<li><img class="usage_img" src="/images/reference_images/' + data[current_page].reference_images[i] + '" alt="' + data[current_page].proj_category + '"><div class = "img_delete material-icons reference">clear</div></li>');
          $('.img_column').filter('.reference_img').find('ul').append('<li><a href="/images/reference_images/' + data[current_page].reference_images[i] + '" data-fancybox="gallery"><img class="usage_img" src="/images/reference_images/' + data[current_page].reference_images[i] + '" alt="' + data[current_page].proj_category + '"></a><div class = "img_delete material-icons reference">clear</div></li>');
        }

      } else {
        $('.modify_delete').remove();

        for (var i = 0; i < data[current_page].concept_images.length; i++) {
          // $('.img_column').filter('.concept_img').find('ul').append('<li><img class="usage_img" src="/images/concept_images/' + data[current_page].concept_images[i] + '" alt="' + data[current_page].proj_category + '"><div class = "img_delete material-icons concept">clear</div></li>');
          $('.img_column').filter('.concept_img').find('ul').append('<li><a href="/images/concept_images/' + data[current_page].concept_images[i] + '" data-fancybox="gallery"><img class="usage_img" src="/images/concept_images/' + data[current_page].concept_images[i] + '" alt="' + data[current_page].proj_category + '"></a></li>');
        }

        for (var i = 0; i < data[current_page].reference_images.length; i++) {
          // $('.img_column').filter('.reference_img').find('ul').append('<li><img class="usage_img" src="/images/reference_images/' + data[current_page].reference_images[i] + '" alt="' + data[current_page].proj_category + '"><div class = "img_delete material-icons reference">clear</div></li>');
          $('.img_column').filter('.reference_img').find('ul').append('<li><a href="/images/reference_images/' + data[current_page].reference_images[i] + '" data-fancybox="gallery"><img class="usage_img" src="/images/reference_images/' + data[current_page].reference_images[i] + '" alt="' + data[current_page].proj_category + '"></a></li>');
        }

      }


      if (data[current_page].proj_title != undefined) {
        $('.proj_title').text(data[current_page].proj_title);
      }

      if (data[current_page].proj_detail != undefined) {
        var details = data[current_page].proj_detail.replace(/\r\n/g, '<br>');
        $('.proj_detail').html(details);
      }

      $('.proj_detail').append('<div class="proj_spec"><div class="date"></div><div class="location"></div><div class="target"></div></div>');

      if (data[current_page].proj_start_date != undefined) {

        if (data[current_page].proj_end_date != undefined) {

          if (event_start_date.getFullYear() != event_end_date.getFullYear()) {
            $('.date').append('<span>일시</span>' + event_start_date.getFullYear() + '년 ' + (event_start_date.getMonth() + 1) + '월 ' + event_start_date.getDate() + '일 - ' + event_end_date.getFullYear() + '년 ' + (event_end_date.getMonth() + 1) + '월 ' + event_end_date.getDate() + '일');
          } else if (event_start_date.getMonth() != event_end_date.getMonth()) {

            if (event_start_date.getFullYear() != event_end_date.getFullYear()) {
              $('.date').append('<span>일시</span>' + event_start_date.getFullYear() + '년 ' + (event_start_date.getMonth() + 1) + '월 ' + event_start_date.getDate() + '일 - ' + event_end_date.getFullYear() + '년 ' + (event_end_date.getMonth() + 1) + '월 ' + event_end_date.getDate() + '일');
            } else {
              $('.date').append('<span>일시</span>' + event_start_date.getFullYear() + '년 ' + (event_start_date.getMonth() + 1) + '월 ' + event_start_date.getDate() + '일 - ' + (event_end_date.getMonth() + 1) + '월 ' + event_end_date.getDate() + '일');
            }

          } else {
            $('.date').append('<span>일시</span>' + event_start_date.getFullYear() + '년 ' + (event_start_date.getMonth() + 1) + '월 ' + event_start_date.getDate() + '일 - ' + event_end_date.getDate() + '일');
          }



        } else if (data[current_page].proj_end_date == undefined) {
          $('.date').append('<span>일시</span>' + event_start_date.getFullYear() + '년 ' + (event_start_date.getMonth() + 1) + '월 ' + event_start_date.getDate() + '일');
        }
      }

      if (data[current_page].proj_location != '') {
        $('.location').append('<span>장소</span>' + data[current_page].proj_location);
      }

      if (data[current_page].proj_target != '') {
        $('.target').append('<span>대상</span>' + data[current_page].proj_target);
      }

      $('.img_wrapper').append('<input type = "text" name = "_id" value = ' + data[current_page]._id + ' style = "display:none;">');

    },
    move_pages: function(data, email) {

      $(document).on('click', '.prev_proj', function() {
        if (current_page == 0) {
          alert('페이지의 처음입니다.');
        } else {
          current_page--;
          activate_page.activate(current_page, data, email);
        }
      });

      $(document).on('click', '.next_proj', function() {

        if (current_page == total_pages) {
          alert('페이지의 끝입니다.');
        } else {
          current_page++;
          activate_page.activate(current_page, data, email);
        }
      });

      $(document).on('click', '.sub_index li', function(e) {
        e.stopPropagation();

        for (var i = 0; i < data.length; i++) {
          if ($(this).text() == data[i].proj_title) {
            current_page = i;
            activate_page.activate(i, data, email)
          }
        }

      });

      $(document).on('click', '.search_results', function(e) {
        e.stopPropagation();
        console.log($(this).text());

        for (var i = 0; i < data.length; i++) {
          if ($(this).text() == data[i].proj_title) {
            current_page = i;
            activate_page.activate(i, data, email)
          }
        }

      });

      $(document).on('click', '.img_delete', function(e) {

        e.stopPropagation();
        var this_img = $(this).parent();
        var image_type = $(this).attr('class').split(' ')[2];
        var image_index = $('.img_delete').filter('.material-icons').filter('.' + image_type).index(this);

        if (confirm("선택한 이미지를 지우시겠습니까?")) {

          $.ajax({
            url: 'image_remove',
            type: 'post',
            data: {
              remove_image_type: image_type,
              remove_image_id: data[current_page]._id,
              remove_image_index: image_index,
            },
            error: function() {
              alert('Error caused');
            },
            success: function(result) {

              if (result.remove) {
                this_img.remove();
              }

            }
          });

        }

      });

      $(document).on('click', '.modify', function(e) {

        $.ajax({
          url: '/save_current_page',
          type: 'post',
          datatype: 'json',
          data: {
            current_page: current_page,
          },
          error: function() {
            alert('Error caused');
          },
          success: function(result) {

            location.href = '/register.html?_id=' + data[current_page]._id;

          }
        });

      });

      $(document).on('click', '.delete', function(e) {

        e.stopPropagation();

        if (confirm("삭제하시겠습니까?")) {

          $.ajax({
            url: '/delete',
            type: 'delete',
            datatype: 'json',
            data: {
              _id: data[current_page]._id,
            },
            error: function() {
              alert("에러가 발생했습니다. 새로고침 후 다시 시도해주세요.");
            },
            success: function(data) {

              if (data.delete == true) {

                alert("삭제되었습니다.");
                location.href = '/';

              } else {

                alert("삭제권한이 없습니다.");
                location.href = '/';

              }

            }
          });

        }
      });

    },
    search_find: function(keyword, data) {

      $('<div class = "results"><ul></ul></div>').insertBefore($('.index_wrapper'));

      if (keyword == '') {
        $('.results').find('ul').append('<li class = "no_results">검색 결과가 없습니다.</li>')
      } else {

        for (var i = 0; i < data.length; i++) {
          if (data[i].proj_title.toLowerCase().includes(keyword.toLowerCase())) {
            $('.results').find('ul').append('<li class = "search_results">' + data[i].proj_title + '</li>')
          }
        }

      }

      if (keyword.includes('사업부')) {

        for (var i = 0; i < data.length; i++) {

          if (data[i].proj_division == null)
            continue;

          for (var j = 0; j < data[i].proj_division.length; j++) {
            console.log(data[i].proj_division[j]);
            if (data[i].proj_division[j] == keyword) {
              $('.results').find('ul').append('<li class = "search_results">' + data[i].proj_title + '</li>')
            }
          }

        }

      }

      if ($('.results').find('ul').find('li').length == 0) {
        $('.results').find('ul').append('<li class = "no_results">검색 결과가 없습니다.</li>')
      }

    }
  }

  var category = {
    init: function() {
      category.bind();
    },
    bind: function() {

      $(document).on('click', '#table_of_contents > li', function(e) { // expand에만 이벤트 리스너를 붙이는게 낫습니다. 아이콘 뿐 아니라 텍스트 전체를 클릭영역으로 확장함.
        e.stopPropagation();
        var toc_id = $(this).attr('data-id');
        if ($(this).find('.expand').text() == 'expand_more') {
          if ($('#' + toc_id).find('li').length > 0) {
            $('.material-icons').filter('.expand').text('expand_more');
            $('.sub_index').removeClass('span_selected');
            $('#table_of_contents .highlight').removeClass('highlight');
            $(this).addClass('highlight');
            $(this).find('.expand').text('expand_less');
            $('#' + toc_id).addClass('span_selected');
          } else {
            alert('아직 등록된 포트폴리오가 없습니다.');
          }

        } else if ($(this).find('.expand').text() == 'expand_less') {

          $(this).find('.expand').text('expand_more');
          $('#' + toc_id).removeClass('span_selected');
          $('#table_of_contents .highlight').removeClass('highlight'); // 열려있던 메뉴를 닫을 때 하이라이트 사라지게 하는 코드
        }

      });

      $(document).on('click', '#logout', function(e) {
        e.stopPropagation();
        location.href = '/logout';
      });

    }

  }

  var regist_image = {

    init: function() {
      regist_image.bind();
    },
    bind: function() {

      function readURL(input, type) {
        if (input.files && input.files[0]) {

          console.log(input.files);

          if (type == 'concept') {
            $(".img_column ").filter(".concept_img").filter('.register').find('.usage_img').filter('.register_image').remove();
            $('<ul></ul>').insertBefore($(".img_column").filter(".concept_img").filter('.register').find('.img_regi_btn').filter('.material-icons'));
          } else if (type = 'reference') {
            $(".img_column ").filter(".reference_img").filter('.register').find('.usage_img').filter('.register_image').remove();
            $('<ul></ul>').insertBefore($(".img_column").filter(".reference_img").filter('.register').find('.img_regi_btn').filter('.material-icons'));
          }

          for (var i = 0; i < input.files.length; i++) {
            var reader = new FileReader();
            reader.onload = function(e) {
              if (type == 'concept') {
                //$('<li><img class = "usage_img register_image" src = "' + e.target.result + '"></li>').insertBefore($('.img_column').filter(".concept_img").find('ul').find('li').eq(0));
                $('.img_column').filter(".concept_img").find('ul').eq(0).append('<li><img class = "usage_img register_image" src = "' + e.target.result + '"></li>')
              } else if (type = 'reference') {
                //$('<li><img class = "usage_img register_image" src = "' + e.target.result + '"></li>').insertBefore($('.img_column').filter(".reference_img").find('ul').find('li').eq(0));
                $('.img_column').filter(".reference_img").find('ul').eq(0).append('<li><img class = "usage_img register_image" src = "' + e.target.result + '"></li>')
              }

            }
            reader.readAsDataURL(input.files[i]);
          }

          if (location.pathname == '/') {

            console.log('image_add');
            var formData = new FormData($('.img_wrapper')[0]);
            //var formData = $('input[name="reference_images"]')[0].files;

            $.ajax({
              url: '/image_add',
              type: 'post',
              processData: false,
              contentType: false,
              data: formData,
              error: function() {
                alert("에러가 발생했습니다. 새로고침 후 다시 시도해주세요.");
              },
              success: function(data) {

                if (data.modify == false) {
                  alert('수정 권한이 없습니다.')
                }

              }
            })

          }

        }
      }

      $('#c_img_register').on('change', function() { // 값이 변경되면
        if (window.FileReader) { // modern browser
          filename = $(this)[0].files[0].name;
        } else { // old IE
          filename = $(this).val().split('/').pop().split('\\').pop(); // 파일명만 추출
        }

        readURL(this, 'concept');

      });

      $('#r_img_register').on('change', function() { // 값이 변경되면
        if (window.FileReader) { // modern browser
          filename = $(this)[0].files[0].name;
        } else { // old IE
          filename = $(this).val().split('/').pop().split('\\').pop(); // 파일명만 추출
        }

        readURL(this, 'reference');

      });

      $('input[name="proj_end_date"]').on('change', function() { // 날짜 값이 변경되면

        var proj_start_date = new Date($('input[name="proj_start_date"]').val());
        var proj_end_date = new Date($('input[name="proj_end_date"]').val());
        if (proj_start_date >= proj_end_date) {
          alert('종료 날짜를 시작날짜보다 늦게 설정해주세요.');
          $('input[name="proj_end_date"]').val('');
        }
      });

      $(document).on('click', '.img_delete_regist', function(e) {
        //수정할때 지운건 지울 이미지
        //등록할때 지운건 file에서 제거할 이미지 (둘 다 복잡)

        if (location.search == '') {

          var image_index = $(this).parent().index();
          console.log(image_index);

        } else {

          var image_type = $(this).attr('class').split(' ')[2];
          var image_index = $(this).attr('name');
          console.log(image_index);

          if (image_type == 'concept') {
            $('.img_column').filter('.concept_img').filter('.register').append('<input type = "text" name = "modify_images_concept" value = ' + image_index + ' style = "display:none;">');
          } else if (image_type == 'reference') {
            $('.img_column').filter('.reference_img').filter('.register').append('<input type = "text" name = "modify_images_reference" value = ' + image_index + ' style = "display:none;">');
          }

        }

        $(this).parent().remove();

      });

    },

  }

  var register = {

    init: function() {
      register.bind();
    },
    bind: function() {

      $(document).on('click', '#add_project', function(e) {
        e.stopPropagation();

        $.ajax({
          url: '/save_current_page',
          type: 'post',
          datatype: 'json',
          data: {
            current_page: current_page,
          },
          error: function() {
            alert('Error caused');
          },
          success: function(result) {
            location.href = '/register.html';
          }
        });

      });

      $(document).on('click', '#regist_cancel', function(e) {

        e.preventDefault();
        e.stopPropagation();
        location.href = '/';

      });

      $(document).on('click', '#regist_button', function(e) {

        e.stopPropagation();

        $('#proj_detail').attr('cols', '5000');

        var formData = new FormData($('.content_wrapper')[0]);

        if (location.search == '') {

          if ($('input[name="proj_title"]').val() != '' && $('input[name="proj_start_date"]').val() != '') {

            if (confirm("등록하시겠습니까?")) {

              $.ajax({
                url: '/regist',
                type: 'post',
                processData: false,
                contentType: false,
                data: formData,
                error: function() {
                  alert("에러가 발생했습니다. 새로고침 후 다시 시도해주세요.");
                  $('#proj_detail').attr('cols', '54');
                },
                success: function(data) {

                  $('#proj_detail').attr('cols', '54');
                  alert("저장되었습니다.");
                  location.href = '/';

                }
              });

            } else {
              $('#proj_detail').attr('cols', '54');
            }

          } else {
            alert('필수 입력사항을 기재해야 합니다.');
            $('#proj_detail').attr('cols', '54');
          }

        } else {

          if ($('input[name="proj_title"]').val() != '' && $('input[name="proj_start_date"]').val() != '') {

            if (confirm("수정하시겠습니까?")) {

              $.ajax({
                url: '/modify',
                type: 'post',
                processData: false,
                contentType: false,
                data: formData,
                error: function() {
                  alert("에러가 발생했습니다. 새로고침 후 다시 시도해주세요.");
                  $('#proj_detail').attr('cols', '54');
                },
                success: function(data) {

                  $('#proj_detail').attr('cols', '54');

                  if (data.modify == true) {

                    alert("수정되었습니다.");
                    location.href = '/';

                  } else {

                    alert("수정 권한이 없습니다.");
                    location.href = '/';

                  }

                }
              });

            } else {
              $('#proj_detail').attr('cols', '54');
            }

          } else {
            $('#proj_detail').attr('cols', '54');
            alert('필수 입력사항을 기재해야 합니다.')
          }

        }

      });

    },

  }

  category.init();
  register.init();
  regist_image.init();
  activate_page.init();

});
